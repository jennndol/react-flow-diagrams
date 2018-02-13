import { getAbsolutePointOnNode } from "../helpers/getPointOnNode";
import { layoutRectangularPath } from "../helpers/layoutRectangularPath";
import { createWire } from "../helpers/createInitialState";
import { connectStart } from "../helpers/connectNodes";
import { findIntersections } from "../helpers/findIntersections";

export const addWire = (state, action) => {
  const startNode = state.nodes.filter(n => n.id === action.nodeId)[0];
  const newStartNode = { ...startNode };
  const newWire = createWireAndConnect(
    newStartNode,
    action.startPos,
    action.point,
    action.startSide
  );
  const newWires = [...state.wires, newWire];
  const newNodes = state.nodes.map(
    n => (n.id === startNode.id ? newStartNode : n)
  );

  return { ...state, wires: findIntersections(newWires), nodes: newNodes };
};

function createWireAndConnect(startNode, startPos, point, startSide) {
  const start = getAbsolutePointOnNode(startNode, startPos, startSide);
  const wire = createWire(true);
  wire.startSide = startSide;
  wire.startPos = startPos;
  wire.points = layoutRectangularPath(
    start,
    point,
    startNode,
    null,
    startSide,
    null
  );
  connectStart(startNode, wire);
  return wire;
}
