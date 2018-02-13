import { convertToRaw } from "draft-js";

export const didStateChange = (oldState, newState) => {
  return (
    didNodesChange(oldState.nodes, newState.nodes) ||
    didWiresChange(oldState.wires, newState.wires)
  );
};

function didNodesChange(oldNodes, newNodes) {
  if (oldNodes.length === newNodes.length) {
    return oldNodes.some((n, i) => didNodeChange(n, newNodes[i]));
  } else {
    return true;
  }
}

function didWiresChange(oldWires, newWires) {
  if (oldWires.length === newWires.length) {
    return oldWires.some((w, i) => didWireChange(w, newWires[i]));
  } else {
    return true;
  }
}

function didNodeChange(oldNode, newNode) {
  return (
    oldNode.id !== newNode.id ||
    oldNode.x !== newNode.x ||
    oldNode.y !== newNode.y ||
    oldNode.width !== newNode.width ||
    oldNode.height !== newNode.height ||
    oldNode.startConnectors.length !== newNode.startConnectors.length ||
    oldNode.endConnectors.length !== newNode.endConnectors.length ||
    oldNode.startConnectors.some((c, i) =>
      didConnectorChange(c, newNode.startConnectors[i])
    ) ||
    oldNode.endConnectors.some((c, i) =>
      didConnectorChange(c, newNode.endConnectors[i])
    ) ||
    didTextChange(oldNode.editorState, newNode.editorState)
  );
}

function didConnectorChange(oldConnector, newConnector) {
  return (
    oldConnector.id !== newConnector.id ||
    oldConnector.pos !== newConnector.pos ||
    oldConnector.side !== newConnector.side
  );
}

function didWireChange(oldWire, newWire) {
  return (
    oldWire.id !== newWire.id ||
    oldWire.startNodeId !== newWire.startNodeId ||
    oldWire.endNodeId !== newWire.endNodeId ||
    oldWire.startSide !== newWire.startSide ||
    oldWire.endSide !== newWire.endSide ||
    oldWire.startPos !== newWire.startPos ||
    oldWire.endPos !== newWire.endPos ||
    oldWire.manualLayout !== newWire.manualLayout ||
    oldWire.points.length !== newWire.points.length ||
    oldWire.points.some((p, i) => didPointChange(p, newWire.points[i])) ||
    didTextChange(oldWire.editorState, newWire.editorState)
  );
}

function didPointChange(oldPoint, newPoint) {
  return oldPoint[0] !== newPoint[0] || oldPoint[1] !== newPoint[1];
}

function didTextChange(oldEditorState, newEditorState) {
  const oldContent = oldEditorState ? oldEditorState.getCurrentContent() : null;
  const newContent = newEditorState ? newEditorState.getCurrentContent() : null;
  if (oldContent === newContent) {
    return false;
  } else {
    const oldIsEmpty = !oldContent || !oldContent.hasText();
    const newIsEmpty = !newContent || !newContent.hasText();
    if (oldIsEmpty && newIsEmpty) {
      return false;
    } else {
      const oldRaw = oldContent ? JSON.stringify(convertToRaw(oldContent)) : "";
      const newRaw = newContent ? JSON.stringify(convertToRaw(newContent)) : "";
      return oldRaw !== newRaw;
    }
  }
}
