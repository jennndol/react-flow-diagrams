export const startTextEditing = id => ({ type: "T/START_TEXT_EDITING", id });

export const finishAnyTextEditing = () => ({
  type: "T/FINISH_ANY_TEXT_EDITING"
});

export const onTextChange = (id, editorState) => ({
  type: "T/ON_TEXT_CHANGE",
  id,
  editorState
});
