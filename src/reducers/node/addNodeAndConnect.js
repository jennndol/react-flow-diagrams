import { createNode, createWire } from "../helpers/createInitialState";
import { connectNodes } from "../helpers/connectNodes";
import { layoutRectangularPath } from "../helpers/layoutRectangularPath";
import { findIntersections } from "../helpers/findIntersections";
import { getAbsolutePointOnNode } from "../helpers/getPointOnNode";

const offset = 80;
const padding = 10;

export const enoughSpaceToAdd = (nodes, id, direction) => {
  const graph = document.getElementById("graph");
  const sourceNode = nodes.filter(n => n.id === id)[0];
  if (direction === "east") {
    return (
      sourceNode.x + 2 * sourceNode.width + offset < graph.clientWidth - padding
    );
  } else if (direction === "west") {
    return sourceNode.x - offset - sourceNode.width > padding;
  } else if (direction === "south") {
    return (
      sourceNode.y + 2 * sourceNode.height + offset <
      graph.clientHeight - padding
    );
  } else {
    return sourceNode.y - offset - sourceNode.height > padding;
  }
};

export const addNodeAndConnect = (state, id, direction) => {
  const wire = createWire(true);
  const sourceNode = { ...state.nodes.filter(n => n.id === id)[0] };
  const newNode = createNode(
    sourceNode.x,
    sourceNode.y,
    sourceNode.width,
    sourceNode.height,
    true
  );

  configureSize(newNode, wire, direction);

  const wireStartPoint = getAbsolutePointOnNode(
    sourceNode,
    0.5,
    wire.startSide
  );
  const wireEndPoint = getAbsolutePointOnNode(newNode, 0.5, wire.endSide);
  wire.points = layoutRectangularPath(
    wireStartPoint,
    wireEndPoint,
    sourceNode,
    newNode,
    wire.startSide,
    wire.endSide
  );

  connectNodes(sourceNode, newNode, wire);

  return {
    ...state,
    nodes: [...state.nodes.map(n => (n.id === id ? sourceNode : n)), newNode],
    wires: findIntersections([...state.wires, wire])
  };
};

function configureSize(newNode, newWire, direction) {
  if (direction === "east") {
    newNode.x += newNode.width + offset;
    newWire.startSide = "right";
    newWire.endSide = "left";
  } else if (direction === "west") {
    newNode.x -= newNode.width + offset;
    newWire.startSide = "left";
    newWire.endSide = "right";
  } else if (direction === "south") {
    newNode.y += newNode.height + offset;
    newWire.startSide = "bottom";
    newWire.endSide = "top";
  } else {
    newNode.y -= newNode.height + offset;
    newWire.startSide = "top";
    newWire.endSide = "bottom";
  }
}
