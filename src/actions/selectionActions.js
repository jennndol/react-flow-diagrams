export const selectAll = () => ({ type: "S/SELECT_ALL" });

export const clearSelection = id => ({ type: "S/CLEAR_SELECTION", id }); // Id optional, will be excluded.

export const updateSelection = (id, selected) => ({
  type: "S/UPDATE_SELECTION",
  id,
  selected
});

export const selectInArea = area => ({ type: "S/SELECT_IN_AREA", area });

export const deleteSelection = () => ({ type: "S/DELETE_SELECTION" });

export const moveSelection = (axis, amount) => ({
  type: "S/MOVE_SELECTION",
  axis,
  amount
});

export const selectNext = () => ({ type: "S/SELECT_NEXT" });

export const copy = () => ({ type: "S/COPY" });

export const paste = () => ({ type: "S/PASTE" });
