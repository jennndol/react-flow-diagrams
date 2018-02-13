const startInset = 7;
const endInset = 7;
const minimumEndSegmentLength = 15;

export const insetPoints = (rawPoints, rawIntersections) => {
  let l = rawPoints.length;
  const points = [...rawPoints];
  const intersections = [...rawIntersections];
  const startSegment = getSegmentData(points[0], points[1]);

  if (Math.abs(startSegment.length) > startInset) {
    const delta = startSegment.length > 0 ? startInset : -startInset;
    points[0] = startSegment.h
      ? [points[0][0] + delta, points[0][1]]
      : [points[0][0], points[0][1] + delta];
  } else {
    points.splice(0, 1);
    intersections.splice(0, 1);
  }

  l = points.length;
  if (l < 2) {
    return { points, intersections };
  }

  const endSegment = getSegmentData(points[l - 2], points[l - 1]);
  if (Math.abs(endSegment.length) > minimumEndSegmentLength) {
    const delta = endSegment.length > 0 ? -endInset : endInset;
    points[l - 1] = endSegment.h
      ? [points[l - 1][0] + delta, points[l - 1][1]]
      : [points[l - 1][0], points[l - 1][1] + delta];
  } else {
    points.splice(l - 1, 1);
    intersections.splice(l - 1, 1);
  }

  return { points, intersections };
};

function getSegmentData(a, b) {
  const h = a[1] === b[1];
  const length = h ? b[0] - a[0] : b[1] - a[1];
  return { h, length };
}
