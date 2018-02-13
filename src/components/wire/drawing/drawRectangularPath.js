import { drawHorizontalSegment, drawVerticalSegment } from "./drawPathSegment";

export const drawLine = (points, intersections) => {
  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (a[1] === b[1] && a[0] !== b[0]) {
      path += drawHorizontalSegment(a, b, intersections[i]);
    } else if (a[0] === b[0] && a[1] !== b[1]) {
      path += drawVerticalSegment(a, b, intersections[i]);
    }
  }
  return path;
};

export const drawHead = (points, filled, headLength, headWidth) => {
  const a = points[points.length - 2];
  const b = points[points.length - 1];
  const length = a[1] === b[1] ? b[0] - a[0] : b[1] - a[1];
  if (Math.abs(length) >= headLength) {
    let x1, y1, x2, y2;
    if (a[1] === b[1]) {
      if (b[0] >= a[0]) {
        x1 = b[0] - headLength;
        y1 = b[1] - headWidth;
        x2 = x1;
        y2 = b[1] + headWidth;
      } else {
        x1 = b[0] + headLength;
        y1 = b[1] - headWidth;
        x2 = x1;
        y2 = b[1] + headWidth;
      }
    } else {
      if (b[1] >= a[1]) {
        x1 = b[0] - headWidth;
        y1 = b[1] - headLength;
        x2 = b[0] + headWidth;
        y2 = y1;
      } else {
        x1 = b[0] + headWidth;
        y1 = b[1] + headLength;
        x2 = b[0] - headWidth;
        y2 = y1;
      }
    }
    return (
      `M ${x1} ${y1} L ${b[0]} ${b[1]} L ${x2} ${y2}` + (filled ? " Z" : "")
    );
  } else {
    return "";
  }
};
