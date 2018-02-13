import { createNode, createWire } from "../helpers/createInitialState";
import { findIntersections } from "../helpers/findIntersections";
import { getDragBounds } from "../helpers/getDragBounds";

const offset = 10;
let storedNodes;
let storedWires;

export const copy = state => {
  storedNodes = state.nodes.filter(n => n.selected);
  storedWires = state.wires.filter(w => w.selected);
  return state;
};

export const canPaste = () =>
  storedNodes &&
  storedWires &&
  (storedNodes.length > 0 || storedWires.length > 0);

export const paste = state => {
  const dragBounds = getDragBounds(storedNodes);
  const offsetX = Math.max(
    dragBounds.minDeltaX,
    Math.min(dragBounds.maxDeltaX, offset)
  );
  const offsetY = Math.max(
    dragBounds.minDeltaY,
    Math.min(dragBounds.maxDeltaY, offset)
  );

  const copiedWires = storedWires.map(w =>
    copyWire(w, storedNodes, offsetX, offsetY)
  );
  const copiedNodes = storedNodes.map(n =>
    copyNode(n, storedWires, copiedWires, offsetX, offsetY)
  );
  const newNodes = [...state.nodes, ...copiedNodes];
  const newWires = [...state.wires, ...copiedWires];

  return { ...state, nodes: newNodes, wires: findIntersections(newWires) };
};

function copyWire(w, storedNodes, offsetX, offsetY) {
  const newWire = createWire(true);
  const startNodeWillBeCopied = storedNodes.some(n => n.id === w.startNodeId);
  const endNodeWillBeCopied = storedNodes.some(n => n.id === w.endNodeId);

  newWire.points = w.points.map(p => [p[0] + offsetX, p[1] + offsetY]);
  if (startNodeWillBeCopied) {
    newWire.startPos = w.startPos;
    newWire.startSide = w.startSide;
  }
  if (endNodeWillBeCopied) {
    newWire.endPos = w.endPos;
    newWire.endSide = w.endSide;
  }
  newWire.editorState = w.editorState;
  return newWire;
}

function copyNode(n, storedWires, copiedWires, offsetX, offsetY) {
  const copiedNode = createNode(
    n.x + offsetX,
    n.y + offsetY,
    n.width,
    n.height,
    true
  );
  copiedNode.startConnectors = copyConnectors(
    n.startConnectors,
    copiedNode.id,
    storedWires,
    copiedWires,
    true
  );
  copiedNode.endConnectors = copyConnectors(
    n.endConnectors,
    copiedNode.id,
    storedWires,
    copiedWires,
    false
  );
  copiedNode.editorState = n.editorState;
  return copiedNode;
}

function copyConnectors(
  connectors,
  newNodeId,
  storedWires,
  copiedWires,
  start
) {
  return connectors
    .map(c => copyConnector(c, newNodeId, storedWires, copiedWires, start))
    .filter(c => c !== null);
}

function copyConnector(connector, newNodeId, storedWires, copiedWires, start) {
  const storedWireIndex = storedWires.findIndex(w => w.id === connector.id);
  if (storedWireIndex > -1) {
    const copiedWire = copiedWires[storedWireIndex];
    const copiedConnector = { ...connector, id: copiedWire.id, selected: true };
    if (start) {
      copiedWire.startNodeId = newNodeId;
    } else {
      copiedWire.endNodeId = newNodeId;
    }
    return copiedConnector;
  } else {
    return null;
  }
}
