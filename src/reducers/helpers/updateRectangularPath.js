import { isStartHorizontal, isEndHorizontal } from "./getWireOrientation";

export const updateRectangularPath = (
  start,
  end,
  startSide,
  endSide,
  oldPoints
) => {
  const startH = isStartHorizontal(startSide, endSide);
  const endH = isEndHorizontal(startSide, endSide);
  const newPoints = [...oldPoints];
  const l = oldPoints.length;
  newPoints[0] = start;
  newPoints[l - 1] = end;

  if (startH) {
    newPoints[1] = [newPoints[1][0], newPoints[0][1]];
  } else {
    newPoints[1] = [newPoints[0][0], newPoints[1][1]];
  }
  if (endH) {
    newPoints[l - 2] = [newPoints[l - 2][0], newPoints[l - 1][1]];
  } else {
    newPoints[l - 2] = [newPoints[l - 1][0], newPoints[l - 2][1]];
  }
  return newPoints;
};
