export const addWire = (nodeId, startPos, point, startSide) => ({
  type: "W/ADD_WIRE",
  nodeId,
  startPos,
  point,
  startSide
});

export const dragWire = (id, point, start, allowSelfConnect) => ({
  type: "W/DRAG_WIRE",
  id,
  point,
  start,
  allowSelfConnect
});

export const perturbWire = (id, points, snapInput) => ({
  type: "W/PERTURB_WIRE",
  id,
  points,
  snapInput
});

export const cleanPoints = id => ({ type: "W/CLEAN_POINTS", id });

export const resetWire = id => ({ type: "W/RESET_WIRE", id });

export const setExtensionInProgress = (id, extensionInProgress) => ({
  type: "W/SET_EXTENSION_IN_PROGRESS",
  id,
  extensionInProgress
});
