import { snapIfInRange } from "./snapBoxToBox";
import { getDragBounds } from "../helpers/getDragBounds";

let nodePositionsAtDragStart = {};
let dragBounds = null;

export const prepareNodeDrag = nodes => {
  const selection = nodes.filter(n => n.selected);
  nodePositionsAtDragStart = selection.reduce((a, n) => {
    a[n.id] = { x: n.x, y: n.y };
    return a;
  }, {});
  dragBounds = getDragBounds(selection);
};

export const dragNodes = (nodes, snapAllowed, draggedNodeId, dX, dY) => {
  const draggedNodeX = nodePositionsAtDragStart[draggedNodeId].x + dX;
  const draggedNodeY = nodePositionsAtDragStart[draggedNodeId].y + dY;
  const nodeAfterDrag = {
    ...nodes.filter(n => n.id === draggedNodeId)[0],
    x: draggedNodeX,
    y: draggedNodeY
  };
  const stationaryNodes = nodes.filter(
    n => !n.selected && n.id !== draggedNodeId
  );
  const nodeAfterSnap = snapAllowed
    ? snapIfInRange(nodeAfterDrag, stationaryNodes)
    : nodeAfterDrag;
  const snappedDeltaX =
    nodeAfterSnap.x - nodePositionsAtDragStart[draggedNodeId].x;
  const snappedDeltaY =
    nodeAfterSnap.y - nodePositionsAtDragStart[draggedNodeId].y;
  const clampedDeltaX = clamp(
    snappedDeltaX,
    dragBounds.minDeltaX,
    dragBounds.maxDeltaX
  );
  const clampedDeltaY = clamp(
    snappedDeltaY,
    dragBounds.minDeltaY,
    dragBounds.maxDeltaY
  );

  return nodes.map(n => dragNode(n, clampedDeltaX, clampedDeltaY));
};

export const resizeNode = (node, snapAllowed, otherNodes, action) => {
  const nodeAfterResize = {
    ...node,
    x: action.x,
    y: action.y,
    width: action.width,
    height: action.height
  };
  const nodeAfterSnap = snapAllowed
    ? snapIfInRange(nodeAfterResize, otherNodes, action.directions)
    : nodeAfterResize;
  return nodeAfterSnap;
};

function dragNode(node, deltaX, deltaY) {
  if (nodePositionsAtDragStart[node.id]) {
    const x = nodePositionsAtDragStart[node.id].x + deltaX;
    const y = nodePositionsAtDragStart[node.id].y + deltaY;
    return { ...node, x, y };
  } else {
    return node;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
