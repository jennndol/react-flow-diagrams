let nextId = 0;

export const createNode = (x, y, width, height, selected) => ({
  id: ++nextId,
  x,
  y,
  width,
  height,
  startConnectors: [],
  endConnectors: [],
  selected,
  editorState: null,
  textEditable: false
});

export const createWire = selected => ({
  id: ++nextId,
  points: [],
  startSide: null,
  endSide: null,
  startNodeId: null,
  endNodeId: null,
  startPos: 0.5,
  endPos: 0.5,
  intersections: [],
  selected,
  manualLayout: false,
  extensionInProgress: false,
  editorState: null,
  textEditable: false
});

export const createInitialState = () => {
  return {
    nodes: [],
    wires: [],
    snapGuides: [],
    wireCreationOn: false,
    dragStatus: null,
    snapAllowed: true,
    currentlyEdited: -1
  };
};
