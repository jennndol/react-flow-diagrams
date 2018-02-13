import { EditorState } from "draft-js";

export const textReducer = (state, action) => {
  switch (action.type.slice(2)) {
    case "START_TEXT_EDITING":
      return setTextEditable(state, action.id, true);
    case "ON_TEXT_CHANGE":
      return onTextChange(state, action.id, action.editorState);
    case "FINISH_ANY_TEXT_EDITING":
      return finishAnyTextEditing(state);
    default:
      return state;
  }
};

function setTextEditable(state, id, textEditable) {
  const nodes = state.nodes.map(n => updateEditable(n, id, textEditable));
  const wires = state.wires.map(w => updateEditable(w, id, textEditable));
  return { ...state, nodes, wires, currentlyEdited: textEditable ? id : -1 };
}

function updateEditable(element, id, textEditable) {
  if (element.id === id && element.textEditable !== textEditable) {
    let editorState = element.editorState
      ? element.editorState
      : EditorState.createEmpty();
    editorState = EditorState.moveFocusToEnd(
      EditorState.moveSelectionToEnd(editorState)
    );
    return { ...element, textEditable, editorState };
  } else {
    return element;
  }
}

function onTextChange(state, id, editorState) {
  const nodes = state.nodes.map(n => (n.id === id ? { ...n, editorState } : n));
  const wires = state.wires.map(w => (w.id === id ? { ...w, editorState } : w));
  return { ...state, nodes, wires };
}

function finishAnyTextEditing(state) {
  if (state.currentlyEdited > -1) {
    return setTextEditable(state, state.currentlyEdited, false);
  } else {
    return state;
  }
}
