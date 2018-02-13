import { didStateChange } from "./compareState";

const limit = 5000;

export const undoable = reducer => (state, action) => {
  if (!state) {
    return newHistory([], reducer(undefined, action), [], null, []);
  } else if (action.type === "BEGIN_USER_ACTION") {
    return beginUserAction(state);
  } else if (action.type === "COMPLETE_USER_ACTION") {
    return completeUserActionIfChanged(state, action);
  } else if (action.type === "DISCARD_USER_ACTION") {
    return discardUserAction(state);
  } else if (action.type === "UNDO") {
    return doUndo(state);
  } else if (action.type === "REDO") {
    return doRedo(state);
  } else {
    return newHistory(
      state.past,
      reducer(state.present, action),
      state.future,
      state.stored,
      state.selection
    );
  }
};

function beginUserAction(state) {
  return newHistory(
    state.past,
    state.present,
    state.future,
    state.present,
    state.selection
  );
}

function completeUserActionIfChanged(state, action) {
  if (!state.stored) {
    throw new Error(
      "User action completed with no initial state stored (" + action.id + ")"
    );
  }
  if (didStateChange(state.stored, state.present)) {
    return completeUserAction(state, action);
  } else {
    return discardUserAction(state);
  }
}

function completeUserAction(state, action) {
  const cut = state.past.length - limit + 1;
  const oldPastToKeep =
    cut > 0 ? state.past.slice(cut, state.past.length) : state.past;
  const newPast = [...oldPastToKeep, state.stored];

  // The ids of the elements involved in the action are recorded here. When
  // the state is restored via undo/redo, these elements are selected.
  const oldSelectionToKeep = state.selection.slice(
    Math.max(cut, 0),
    state.past.length
  );
  const newSelection = [
    ...oldSelectionToKeep,
    getSelectedIds(state.present, state.stored, action)
  ];

  return newHistory(newPast, state.present, [], null, newSelection);
}

function discardUserAction(state) {
  return newHistory(
    state.past,
    state.present,
    state.future,
    null,
    state.selection
  );
}

function doUndo(state) {
  if (state.past.length === 0) {
    return state;
  } else {
    const i = state.past.length - 1;
    const newPast = state.past.slice(0, i);
    const newPresent = cleanAndUpdateSelection(
      state.past[i],
      state.selection[i]
    );
    const newFuture = [state.present, ...state.future];
    return newHistory(newPast, newPresent, newFuture, null, state.selection);
  }
}

function doRedo(state) {
  if (state.future.length === 0) {
    return state;
  } else {
    const newPast = [...state.past, state.present];
    const newPresent = cleanAndUpdateSelection(
      state.future[0],
      state.selection[state.past.length]
    );
    const newFuture = state.future.slice(1, state.future.length);
    return newHistory(newPast, newPresent, newFuture, null, state.selection);
  }
}

function newHistory(past, present, future, stored, selection) {
  return { past, present, future, stored, selection };
}

function getSelectedIds(stateAfter, stateBefore, action) {
  switch (action.selection) {
    case "SELECTED_NODES":
      return stateAfter.nodes.filter(n => n.selected).map(n => n.id);
    case "SELECTION_BEFORE":
      return getAllSelected(stateBefore);
    case "SELECTION_AFTER":
      return getAllSelected(stateAfter);
    case "ID":
      return [action.id];
    default:
      return [];
  }
}

function getAllSelected(state) {
  const selectedNodeIds = state.nodes.filter(n => n.selected).map(n => n.id);
  const selectedWireIds = state.wires.filter(w => w.selected).map(w => w.id);
  return selectedNodeIds.concat(selectedWireIds);
}

function cleanAndUpdateSelection(state, selectedIds) {
  return {
    ...state,
    nodes: updateNodes(state.nodes, selectedIds),
    wires: updateWires(state.wires, selectedIds),
    snapGuides: [],
    wireCreationOn: false,
    dragStatus: null,
    snapAllowed: true,
    currentlyEdited: -1
  };
}

function updateNodes(nodes, selectedIds) {
  return nodes.map(n => ({
    ...n,
    selected: selectedIds.includes(n.id),
    textEditable: false,
    startConnectors: updateConnectors(n.startConnectors, selectedIds),
    endConnectors: updateConnectors(n.endConnectors, selectedIds)
  }));
}

function updateConnectors(connectors, selectedIds) {
  return connectors.map(c => ({ ...c, selected: selectedIds.includes(c.id) }));
}

function updateWires(wires, selectedIds) {
  return wires.map(w => ({
    ...w,
    selected: selectedIds.includes(w.id),
    textEditable: false
  }));
}
