import { layoutRectangularPath } from "../helpers/layoutRectangularPath";
import { updateRectangularPath } from "../helpers/updateRectangularPath";
import { snapToBox } from "./snapPointToBox";
import { connectStart, connectEnd } from "../helpers/connectNodes";

export const dragWire = (wire, nodes, point, start, allowSelfConnect) => {
  return start
    ? dragWireStart(wire, nodes, point, allowSelfConnect)
    : dragWireEnd(wire, nodes, point, allowSelfConnect);
};

function dragWireStart(wire, nodes, point, allowSelfConnect) {
  const endNode =
    wire.endNodeId !== null
      ? nodes.filter(n => n.id === wire.endNodeId)[0]
      : null;
  const endPoint = wire.points[wire.points.length - 1];

  const snapped = getFirstSnapped(point, nodes, endNode, allowSelfConnect);
  const startPoint = snapped ? snapped.point : point;
  const startNode = snapped ? snapped.node : null;
  const startSide = snapped ? snapped.side : null;
  const updateAllowed = wire.startSide === startSide;

  let newPoints;
  if (wire.manualLayout && updateAllowed) {
    newPoints = updateRectangularPath(
      startPoint,
      endPoint,
      startSide,
      wire.endSide,
      wire.points
    );
  } else {
    newPoints = layoutRectangularPath(
      startPoint,
      endPoint,
      startNode,
      endNode,
      startSide,
      wire.endSide
    );
  }
  const newWire = {
    ...wire,
    points: newPoints,
    manualLayout: wire.manualLayout && updateAllowed
  };
  const newNodes = [...nodes];

  if (
    wire.startNodeId !== null &&
    (!snapped || wire.startNodeId !== startNode.id)
  ) {
    const oldStartNode = nodes.filter(n => n.id === wire.startNodeId)[0];
    const index = nodes.indexOf(oldStartNode);
    const nodeToDisconnect = Object.assign({}, oldStartNode);
    disconnectStart(nodeToDisconnect, newWire);
    newNodes[index] = nodeToDisconnect;
  }

  if (snapped) {
    const index = nodes.indexOf(startNode);
    const nodeToConnect = Object.assign({}, startNode);
    newWire.startPos = getPos(startPoint, nodeToConnect, startSide);
    newWire.startSide = startSide;
    connectStart(nodeToConnect, newWire);
    newNodes[index] = nodeToConnect;
  }

  return { wire: newWire, nodes: newNodes };
}

function dragWireEnd(wire, nodes, point, allowSelfConnect) {
  const startNode =
    wire.startNodeId !== null
      ? nodes.filter(n => n.id === wire.startNodeId)[0]
      : null;
  const startPoint = wire.points[0];

  const snapped = getFirstSnapped(point, nodes, startNode, allowSelfConnect);
  const endPoint = snapped ? snapped.point : point;
  const endNode = snapped ? snapped.node : null;
  const endSide = snapped ? snapped.side : null;
  const updateAllowed = wire.endSide === endSide;

  let newPoints;
  if (wire.manualLayout && updateAllowed) {
    newPoints = updateRectangularPath(
      startPoint,
      endPoint,
      wire.startSide,
      endSide,
      wire.points
    );
  } else {
    newPoints = layoutRectangularPath(
      startPoint,
      endPoint,
      startNode,
      endNode,
      wire.startSide,
      endSide
    );
  }
  const newWire = {
    ...wire,
    points: newPoints,
    manualLayout: wire.manualLayout && updateAllowed
  };
  const newNodes = [...nodes];

  if (wire.endNodeId !== null && (!snapped || wire.endNodeId !== endNode.id)) {
    const oldEndNode = nodes.filter(n => n.id === wire.endNodeId)[0];
    const index = nodes.indexOf(oldEndNode);
    const nodeToDisconnect = Object.assign({}, oldEndNode);
    disconnectEnd(nodeToDisconnect, newWire);
    newNodes[index] = nodeToDisconnect;
  }

  if (snapped) {
    const index = nodes.indexOf(endNode);
    const nodeToConnect = Object.assign({}, endNode);
    newWire.endPos = getPos(endPoint, nodeToConnect, endSide);
    newWire.endSide = endSide;
    connectEnd(nodeToConnect, newWire);
    newNodes[index] = nodeToConnect;
  }

  return { wire: newWire, nodes: newNodes };
}

function getFirstSnapped(point, nodes, oppositeNode, allowSelfConnect) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    if (node !== oppositeNode || allowSelfConnect) {
      const snapResult = snapToBox(point[0], point[1], node);
      if (snapResult.snappedSide !== null) {
        const newPoint = [snapResult.x, snapResult.y];
        return { point: newPoint, node, side: snapResult.snappedSide };
      }
    }
  }
}

function getPos(point, node, side) {
  let pos;
  if (side === "left" || side === "right") {
    pos = (point[1] - node.y) / node.height;
  } else {
    pos = (point[0] - node.x) / node.width;
  }
  return pos > 0.49 && pos < 0.51 ? 0.5 : pos;
}

function disconnectStart(node, wire) {
  const index = node.startConnectors.findIndex(c => c.id === wire.id);
  if (index >= 0) {
    node.startConnectors.splice(index, 1);
  }
  wire.startNodeId = null;
  wire.startSide = null;
}

function disconnectEnd(node, wire) {
  const index = node.endConnectors.findIndex(c => c.id === wire.id);
  if (index >= 0) {
    node.endConnectors.splice(index, 1);
  }
  wire.endNodeId = null;
  wire.endSide = null;
}
