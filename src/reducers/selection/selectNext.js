import { syncConnectorSelection } from "./syncConnectorSelection";
import { findIntersections } from "../helpers/findIntersections";

export const selectNext = state => {
  const id = getIdToSelect(state);
  if (id < 0) {
    return state;
  } else {
    const nodes = state.nodes.map(n => updateSelection(n, n.id === id));
    const wires = state.wires.map(w => updateSelection(w, w.id === id));
    syncConnectorSelection(nodes, state.wires, wires);
    return { ...state, nodes, wires: findIntersections(wires) };
  }
};

function getIdToSelect(state) {
  const selectedIds = getIds(state.nodes, state.wires, true);
  const unselectedIds = getIds(state.nodes, state.wires, false);

  if (selectedIds.length > 0 && unselectedIds.length > 0) {
    const maxSelectedId = Math.max(...selectedIds);
    const nextUnselectedId = Math.min(
      ...unselectedIds.filter(id => id > maxSelectedId)
    );
    return isFinite(nextUnselectedId)
      ? nextUnselectedId
      : Math.min(...unselectedIds);
  } else if (unselectedIds.length > 0) {
    return Math.min(...unselectedIds);
  } else if (selectedIds.length > 0) {
    return Math.min(...selectedIds);
  } else {
    return -1;
  }
}

function getIds(nodes, wires, selected) {
  return filterBySelection(nodes, selected).concat(
    filterBySelection(wires, selected)
  );
}

function filterBySelection(elements, selected) {
  return elements.filter(e => e.selected === selected).map(e => e.id);
}

function updateSelection(element, selected) {
  return element.selected === selected ? element : { ...element, selected };
}
