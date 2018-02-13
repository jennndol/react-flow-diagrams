import { layoutRectangularPath } from "../helpers/layoutRectangularPath";
import { updateRectangularPath } from "../helpers/updateRectangularPath";
import { getAbsolutePointOnNode } from "../helpers/getPointOnNode";

export const syncWiresOnNodeDrag = (wires, nodes) => {
  return wires.map(w => syncWireOnNodeDrag(w, nodes));
};

export const syncWiresOnNodeResize = (wires, nodes, resizedNodeId) => {
  return wires.map(w => syncWireOnNodeResize(w, nodes, resizedNodeId));
};

function syncWireOnNodeDrag(wire, nodes) {
  const startNode = nodes.filter(n => n.id === wire.startNodeId)[0];
  const endNode = nodes.filter(n => n.id === wire.endNodeId)[0];
  if (isDragged(startNode) || isDragged(endNode)) {
    return { ...wire, points: updatePoints(startNode, endNode, wire) };
  } else {
    return wire;
  }
}

function syncWireOnNodeResize(wire, nodes, resizedNodeId) {
  if (wire.startNodeId === resizedNodeId || wire.endNodeId === resizedNodeId) {
    const startNode = nodes.filter(n => n.id === wire.startNodeId)[0];
    const endNode = nodes.filter(n => n.id === wire.endNodeId)[0];
    return { ...wire, points: updatePoints(startNode, endNode, wire) };
  } else {
    return wire;
  }
}

function updatePoints(startNode, endNode, wire) {
  const oldStartPoint = wire.points[0];
  const oldEndPoint = wire.points[wire.points.length - 1];
  let startPoint, endPoint;
  if (isDragged(startNode)) {
    startPoint = getAbsolutePointOnNode(
      startNode,
      wire.startPos,
      wire.startSide
    );
  }
  if (isDragged(endNode)) {
    endPoint = getAbsolutePointOnNode(endNode, wire.endPos, wire.endSide);
  }
  if (isDragged(endNode) && !startNode) {
    const newStartX = oldStartPoint[0] + endPoint[0] - oldEndPoint[0];
    const newStartY = oldStartPoint[1] + endPoint[1] - oldEndPoint[1];
    startPoint = [newStartX, newStartY];
  }
  if (isDragged(startNode) && !endNode) {
    const newEndX = oldEndPoint[0] + startPoint[0] - oldStartPoint[0];
    const newEndY = oldEndPoint[1] + startPoint[1] - oldStartPoint[1];
    endPoint = [newEndX, newEndY];
  }
  if (!startPoint) {
    startPoint = oldStartPoint;
  }
  if (!endPoint) {
    endPoint = oldEndPoint;
  }

  if (isLayoutNeeded(startPoint, endPoint, wire.points)) {
    if (canTranslate(startPoint, endPoint, wire.points)) {
      return translatePoints(startPoint, wire.points);
    } else if (wire.manualLayout) {
      return updateRectangularPath(
        startPoint,
        endPoint,
        wire.startSide,
        wire.endSide,
        wire.points
      );
    } else {
      return layoutRectangularPath(
        startPoint,
        endPoint,
        startNode,
        endNode,
        wire.startSide,
        wire.endSide
      );
    }
  } else {
    return wire.points;
  }
}

function isDragged(node) {
  return node && node.selected;
}

function isLayoutNeeded(start, end, points) {
  const oldStart = points[0];
  const oldEnd = points[points.length - 1];
  return (
    oldStart[0] !== start[0] ||
    oldStart[1] !== start[1] ||
    oldEnd[0] !== end[0] ||
    oldEnd[1] !== end[1]
  );
}

function canTranslate(start, end, points) {
  const oldStart = points[0];
  const oldEnd = points[points.length - 1];
  const oldDeltaX = oldEnd[0] - oldStart[0];
  const oldDeltaY = oldEnd[1] - oldStart[1];
  const deltaX = end[0] - start[0];
  const deltaY = end[1] - start[1];
  return oldDeltaX === deltaX && oldDeltaY === deltaY;
}

function translatePoints(start, points) {
  const deltaX = start[0] - points[0][0];
  const deltaY = start[1] - points[0][1];
  return points.map(p => [p[0] + deltaX, p[1] + deltaY]);
}
