import { layoutRectangularPath } from "../helpers/layoutRectangularPath";

export const resetWire = (wire, nodes) => {
  const startNode =
    wire.startNodeId !== null
      ? nodes.filter(n => n.id === wire.startNodeId)[0]
      : null;
  const startPoint = wire.points[0];

  const endNode =
    wire.endNodeId !== null
      ? nodes.filter(n => n.id === wire.endNodeId)[0]
      : null;
  const endPoint = wire.points[wire.points.length - 1];
  const newPoints = layoutRectangularPath(
    startPoint,
    endPoint,
    startNode,
    endNode,
    wire.startSide,
    wire.endSide
  );
  return { ...wire, points: newPoints, manualLayout: false };
};
