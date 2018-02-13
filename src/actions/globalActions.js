export const setDragStatus = (status, id, index, cursor) => ({
  type: "G/SET_DRAG_STATUS",
  status,
  id,
  index,
  cursor
});

export const clearDragStatus = () => ({
  type: "G/SET_DRAG_STATUS",
  status: null,
  id: -1,
  index: -1,
  cursor: null
});

export const setWireCreationOn = wireCreationOn => ({
  type: "G/SET_WIRE_CREATION_ON",
  wireCreationOn
});

export const setSnapAllowed = snapAllowed => ({
  type: "G/SET_SNAP_ALLOWED",
  snapAllowed
});
