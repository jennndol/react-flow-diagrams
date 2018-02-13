import { movePointRectangular } from "../../components/wire/path/movePoints";

const snapThreshold = 6;

export const snapPathToPath = (points, otherPoints, snapInput) => {
  const allSegmentsInRange = getAllSegmentsInRange(
    points,
    otherPoints,
    snapInput
  );
  const closestX = allSegmentsInRange.reduce(
    (min, segment) => getCloserSegment(min, segment, false),
    null
  );
  const closestY = allSegmentsInRange.reduce(
    (min, segment) => getCloserSegment(min, segment, true),
    null
  );

  if (closestX !== null || closestY !== null) {
    const draggedPoint = points[snapInput.i];
    const newX = closestX !== null ? closestX.transverse : draggedPoint[0];
    const newY = closestY !== null ? closestY.transverse : draggedPoint[1];
    const snappedPoints = movePointRectangular(
      points,
      snapInput.i,
      snapInput.h,
      newX,
      newY
    );
    const snapGuides = getSnapGuides(
      allSegmentsInRange,
      snappedPoints[snapInput.i],
      snapInput.axis
    );
    return { points: snappedPoints, snapGuides };
  } else {
    return { points, snapGuides: [] };
  }
};

function getAllSegmentsInRange(points, otherPoints, snapInput) {
  const draggedPoint = points[snapInput.i];
  const ownSegmentsInRange = getSegmentsInRange(
    points,
    draggedPoint,
    snapInput.axis,
    snapInput.i
  );
  const otherSegmentsInRange = otherPoints
    .map(points => getSegmentsInRange(points, draggedPoint, snapInput.axis))
    .reduce((a, b) => a.concat(b), []);

  return ownSegmentsInRange.concat(otherSegmentsInRange);
}

function getSegmentsInRange(points, draggedPoint, dragAxis, draggedIndex) {
  const segments = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const h = a[1] === b[1] && a[0] !== b[0];
    const v = a[0] === b[0] && a[1] !== b[1];
    const canSnapToH = (dragAxis === "v" || dragAxis === "both") && h;
    const canSnapToV = (dragAxis === "h" || dragAxis === "both") && v;

    if (canSnapToH || canSnapToV) {
      const start = h ? a[0] : a[1];
      const end = h ? b[0] : b[1];
      const transverse = h ? a[1] : a[0];
      const draggedPointTransverse = h ? draggedPoint[1] : draggedPoint[0];
      const delta = Math.abs(draggedPointTransverse - transverse);
      const selfDragged =
        draggedIndex && (i === draggedIndex - 1 || i === draggedIndex);

      if (delta < snapThreshold) {
        segments.push({ start, end, transverse, h, delta, selfDragged });
      }
    }
  }
  return segments;
}

function getCloserSegment(currentMin, segment, h) {
  if (
    segment.h === h &&
    !segment.selfDragged &&
    (currentMin === null || segment.delta < currentMin.delta)
  ) {
    return segment;
  } else {
    return currentMin;
  }
}

function getSnapGuides(allSegmentsInRange, snappedPoint, dragAxis) {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (let segment of allSegmentsInRange) {
    if (dragAxis === "h" || dragAxis === "both") {
      if (
        !segment.h &&
        (segment.selfDragged || segment.transverse === snappedPoint[0])
      ) {
        const segmentMin = Math.min(segment.start, segment.end);
        const segmentMax = Math.max(segment.start, segment.end);
        if (segmentMax < minY) {
          minY = segmentMax;
        }
        if (segmentMin > maxY) {
          maxY = segmentMin;
        }
      }
    }
    if (dragAxis === "v" || dragAxis === "both") {
      if (
        segment.h &&
        (segment.selfDragged || segment.transverse === snappedPoint[1])
      ) {
        const segmentMin = Math.min(segment.start, segment.end);
        const segmentMax = Math.max(segment.start, segment.end);
        if (segmentMax < minX) {
          minX = segmentMax;
        }
        if (segmentMin > maxX) {
          maxX = segmentMin;
        }
      }
    }
  }
  const snapGuides = [];
  if (minX < maxX) {
    const x1 = minX;
    const x2 = maxX;
    const y1 = snappedPoint[1];
    const y2 = y1;
    snapGuides.push({ x1, x2, y1, y2 });
  }
  if (minY < maxY) {
    const x1 = snappedPoint[0];
    const x2 = x1;
    const y1 = minY;
    const y2 = maxY;
    snapGuides.push({ x1, x2, y1, y2 });
  }
  return snapGuides;
}
