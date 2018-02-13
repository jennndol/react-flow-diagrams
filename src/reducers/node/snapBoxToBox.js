const snapThreshold = 6;
const alignments = [
  ["h", "inner"],
  ["h", "mid"],
  ["h", "outer"],
  ["v", "inner"],
  ["v", "mid"],
  ["v", "outer"]
];

export const snapIfInRange = (draggedBox, boxes, resizeDirections) => {
  const otherBoxes = boxes.filter(b => b.id !== draggedBox.id);
  const snapQueries = otherBoxes.map(b =>
    checkBoxSnap(draggedBox, b, resizeDirections)
  );
  const closestSnappedX = snapQueries.reduce(
    (min, snapQuery) => minSnapped(min, snapQuery, "h"),
    null
  );
  const closestSnappedY = snapQueries.reduce(
    (min, snapQuery) => minSnapped(min, snapQuery, "v"),
    null
  );

  let snappedBox = draggedBox;
  if (closestSnappedX !== null) {
    snappedBox = applySnapX(snappedBox, closestSnappedX.h, resizeDirections);
  }
  if (closestSnappedY !== null) {
    snappedBox = applySnapY(snappedBox, closestSnappedY.v, resizeDirections);
  }
  return snappedBox;
};

export const getSnapGuides = (box, otherBoxes, resizeDirections) => {
  const alignmentQueries = otherBoxes.map(otherBox =>
    checkBoxAlignments(box, otherBox, resizeDirections)
  );
  return alignments.reduce(
    (guides, a) => addGuideIfAligned(guides, box, alignmentQueries, a),
    []
  );
};

function checkBoxSnap(box, otherBox, resizeDirections) {
  const h = checkBoxSnapOnAxis(box, otherBox, "h", resizeDirections);
  const v = checkBoxSnapOnAxis(box, otherBox, "v", resizeDirections);
  return { h, v };
}

function checkBoxSnapOnAxis(box, otherBox, axis, resizeDirections) {
  const startDelta = delta(box, otherBox, axis, "inner", false);
  const midDelta = delta(
    box,
    otherBox,
    axis,
    "mid",
    resizeDirections ? false : true
  );
  const endDelta = delta(box, otherBox, axis, "outer", false);
  const startAbs = Math.abs(startDelta);
  const midAbs = Math.abs(midDelta);
  const endAbs = Math.abs(endDelta);
  const canSnapStart = resizeDirections
    ? startResizing(resizeDirections, axis)
    : true;
  const canSnapMid = resizeDirections
    ? anyResizing(resizeDirections, axis)
    : true;
  const canSnapEnd = resizeDirections
    ? endResizing(resizeDirections, axis)
    : true;
  const midThreshold = resizeDirections ? snapThreshold / 2 : snapThreshold;

  if (
    canSnapMid &&
    midAbs <= startAbs &&
    midAbs <= endAbs &&
    midAbs < midThreshold
  ) {
    return { snapped: true, delta: midDelta, axis: "mid" };
  } else if (
    canSnapStart &&
    (!canSnapEnd || startAbs <= endAbs) &&
    startAbs < snapThreshold
  ) {
    return { snapped: true, delta: startDelta, axis: "inner" };
  } else if (canSnapEnd && endAbs < snapThreshold) {
    return { snapped: true, delta: endDelta, axis: "outer" };
  } else {
    return { snapped: false };
  }
}

function startResizing(resizeDirections, axis) {
  return axis === "h"
    ? resizeDirections.includes("west")
    : resizeDirections.includes("north");
}

function endResizing(resizeDirections, axis) {
  return axis === "h"
    ? resizeDirections.includes("east")
    : resizeDirections.includes("south");
}

function anyResizing(resizeDirections, axis) {
  return (
    startResizing(resizeDirections, axis) || endResizing(resizeDirections, axis)
  );
}

function minSnapped(min, snapQuery, axis) {
  if (
    snapQuery[axis].snapped &&
    (min === null ||
      Math.abs(snapQuery[axis].delta) < Math.abs(min[axis].delta))
  ) {
    return snapQuery;
  } else {
    return min;
  }
}

function applySnapX(box, snapQuery, resizeDirections) {
  if (resizeDirections) {
    if (snapQuery.axis === "inner") {
      const x = box.x + snapQuery.delta;
      const width = box.width - snapQuery.delta;
      return { ...box, x, width };
    } else if (snapQuery.axis === "mid") {
      if (resizeDirections.includes("west")) {
        const x = box.x + 2 * snapQuery.delta;
        const width = box.width - 2 * snapQuery.delta;
        return { ...box, x, width };
      } else {
        const width = box.width + 2 * snapQuery.delta;
        return { ...box, width };
      }
    } else {
      const width = box.width + snapQuery.delta;
      return { ...box, width };
    }
  } else {
    return { ...box, x: box.x + Math.floor(snapQuery.delta) };
  }
}

function applySnapY(box, snapQuery, resizeDirections) {
  if (resizeDirections) {
    if (snapQuery.axis === "inner") {
      const y = box.y + snapQuery.delta;
      const height = box.height - snapQuery.delta;
      return { ...box, y, height };
    } else if (snapQuery.axis === "mid") {
      if (resizeDirections.includes("north")) {
        const y = box.y + 2 * snapQuery.delta;
        const height = box.height - 2 * snapQuery.delta;
        return { ...box, y, height };
      } else {
        const height = box.height + 2 * snapQuery.delta;
        return { ...box, height };
      }
    } else {
      const height = box.height + snapQuery.delta;
      return { ...box, height };
    }
  } else {
    return { ...box, y: box.y + Math.floor(snapQuery.delta) };
  }
}

function checkBoxAlignments(box, otherBox, resizeDirections) {
  return alignments.reduce(
    (results, a) =>
      checkBoxAlignment(results, box, otherBox, a, resizeDirections),
    { h: {}, v: {} }
  );
}

function checkBoxAlignment(results, box, otherBox, a, resizeDirections) {
  const resizeOk = resizeDirections
    ? anyResizing(resizeDirections, a[0])
    : true;
  const aligned = resizeOk && isAligned(box, otherBox, a);
  results[a[0]][a[1]] = aligned;
  if (aligned && !results[a[0]].boxSpan) {
    results[a[0]].boxSpan = transverseBoxSpan(otherBox, a);
  }
  return results;
}

function isAligned(box, otherBox, a) {
  return Math.abs(value(box, a[0], a[1]) - value(otherBox, a[0], a[1])) <= 0.5;
}

function delta(box, otherBox, axis, point, floor) {
  const v1 = value(otherBox, axis, point);
  const v2 = value(box, axis, point);
  return floor ? Math.floor(v1) - Math.floor(v2) : v1 - v2;
}

function value(box, axis, point) {
  const start = axis === "h" ? box.x : box.y;
  const length = axis === "h" ? box.width : box.height;
  if (point === "inner") {
    return start;
  } else if (point === "mid") {
    return start + length / 2;
  } else if (point === "outer") {
    return start + length;
  }
}

function transverseBoxSpan(box, a) {
  const h = a[0] === "h";
  const start = h ? box.y : box.x;
  const end = h ? box.y + box.height : box.x + box.width;
  return [start, end];
}

function addGuideIfAligned(guides, box, alignmentQueries, a) {
  const alignmentResults = alignmentQueries.filter(q => q[a[0]][a[1]]);
  if (alignmentResults.length > 0) {
    const position = getLinePosition(box, alignmentResults, a);
    if (position[0] < position[1]) {
      if (a[0] === "v") {
        const x1 = position[0];
        const x2 = position[1];
        const y1 = Math.floor(value(box, a[0], a[1]));
        const y2 = y1;
        guides.push({ x1, x2, y1, y2 });
      } else {
        const y1 = position[0];
        const y2 = position[1];
        const x1 = Math.floor(value(box, a[0], a[1]));
        const x2 = x1;
        guides.push({ x1, x2, y1, y2 });
      }
    }
  }
  return guides;
}

function getLinePosition(box, alignmentResults, a) {
  const boxSpan = transverseBoxSpan(box, a);
  const alignedBoxesMinEnd = Math.min(
    ...alignmentResults.map(r => r[a[0]].boxSpan[1])
  );
  const alignedBoxesMaxStart = Math.max(
    ...alignmentResults.map(r => r[a[0]].boxSpan[0])
  );
  const start =
    alignedBoxesMinEnd < boxSpan[0] ? alignedBoxesMinEnd : boxSpan[1];
  const end =
    alignedBoxesMaxStart > boxSpan[1] ? alignedBoxesMaxStart : boxSpan[0];
  return [start, end];
}
