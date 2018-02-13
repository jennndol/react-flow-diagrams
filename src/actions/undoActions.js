export const beginUserAction = () => ({ type: "BEGIN_USER_ACTION" });

export const completeUserAction = (selection, id) => ({
  type: "COMPLETE_USER_ACTION",
  selection,
  id
});

export const discardUserAction = () => ({ type: "DISCARD_USER_ACTION" });

export const undo = () => ({ type: "UNDO" });

export const redo = () => ({ type: "REDO" });
