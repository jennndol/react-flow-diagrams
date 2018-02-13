const startInset = 10;
const endInset = 22;
const inset = 5;
const mismatchThreshold = 10;

export const findIntersections = wires => {
  const queries = wires.map((w, i) => queryAllIntersections(w, wires, i));
  const intersections = createIntersectionsAndCheckForMismatch(queries);
  intersections.forEach((w, i) =>
    w.forEach((s, j) => sortIntersections(s, wires[i].points, j))
  );
  return wires.map((w, i) => updateIntersectionsIfChanged(w, intersections[i]));
};

function queryAllIntersections(wire, wires, i) {
  const queriesForWire = [];
  for (let j = 0; j <= i; j++) {
    queryWireIntersections(wire, wires[j], queriesForWire, i, j);
  }
  return queriesForWire;
}

function queryWireIntersections(
  wire,
  otherWire,
  queriesForWire,
  wireIndex,
  otherWireIndex
) {
  for (let i = 0; i < wire.points.length - 1; i++) {
    if (!queriesForWire[i]) {
      queriesForWire[i] = [];
    }
    const a = wire.points[i];
    const b = wire.points[i + 1];
    const aInset = i === 0 ? startInset : inset;
    const bInset = i === wire.points.length - 2 ? endInset : inset;
    const abh = a[1] === b[1];
    // Don't include self-intersections for segments after the current segment:
    const jMax = wire === otherWire ? i : otherWire.points.length - 1;
    for (let j = 0; j < jMax; j++) {
      const c = otherWire.points[j];
      const d = otherWire.points[j + 1];
      const cInset = j === 0 ? startInset : inset;
      const dInset = j === otherWire.points.length - 2 ? endInset : inset;
      const cdh = c[1] === d[1];

      if (abh !== cdh) {
        if (abh && intersects(a, b, c, d, aInset, bInset, cInset, dInset)) {
          queriesForWire[i].push({
            p: [c[0], a[1]],
            h: true,
            otherWireIndex,
            otherSegmentIndex: j,
            added: false
          });
        } else if (
          cdh &&
          intersects(c, d, a, b, cInset, dInset, aInset, bInset)
        ) {
          queriesForWire[i].push({
            p: [a[0], c[1]],
            h: false,
            otherWireIndex,
            otherSegmentIndex: j,
            added: false
          });
        }
      }
    }
  }
}

// Checks if a horizontal line-segment AB intersects with a vertical line-segment CD, minus the given insets.
function intersects(a, b, c, d, aInset, bInset, cInset, dInset) {
  return (
    intersectsHorizontal(a, b, c, d, aInset, bInset) &&
    intersectsVertical(a, b, c, d, cInset, dInset)
  );
}

function intersectsHorizontal(a, b, c, d, aInset, bInset) {
  return (
    (c[0] > a[0] + aInset && c[0] < b[0] - bInset) ||
    (c[0] > b[0] + bInset && c[0] < a[0] - aInset)
  );
}

function intersectsVertical(a, b, c, d, cInset, dInset) {
  return (
    (a[1] > c[1] + cInset && a[1] < d[1] - dInset) ||
    (a[1] > d[1] + dInset && a[1] < c[1] - cInset)
  );
}

function createIntersectionsAndCheckForMismatch(queries) {
  const intersections = queries.map(w => w.map(s => [])); // Create empty array of arrays for all wires and segments.
  let nothingMoreToAdd = false;
  while (!nothingMoreToAdd) {
    // If a vertical and horizontal intersection are too close to each other it will look bad. So we make both intersections
    // horizontal -- i.e. rather than adding the vertical intersection we add a horizontal one to the other wire. We keep
    // doing this until there are no more vertical intersections close to a horizontal one.
    nothingMoreToAdd = addAllHorizontal(intersections, queries);
  }
  queries.forEach((w, i) =>
    w.forEach((s, j) => s.forEach(q => addIfVertical(intersections, q, i, j)))
  );
  return intersections;
}

function addAllHorizontal(intersections, queries) {
  let nothingAdded = true;
  queries.forEach((w, i) =>
    w.forEach((s, j) =>
      s.forEach(q => {
        const wasAdded = addIfHorizontal(intersections, q, queries, i, j);
        if (wasAdded) {
          nothingAdded = false;
        }
      })
    )
  );
  return nothingAdded;
}

function addIfHorizontal(intersections, query, queries, i, j) {
  if (
    !query.added &&
    !query.h &&
    isTooCloseToHorizontalIntersection(query.p, queries)
  ) {
    query.h = true;
    query.added = true;
    intersections[query.otherWireIndex][query.otherSegmentIndex].push(
      query.p[0]
    );
    return true;
  } else if (!query.added && query.h) {
    intersections[i][j].push(query.h ? query.p[0] : query.p[1]);
    query.added = true;
    return true;
  } else {
    return false;
  }
}

function addIfVertical(intersections, query, i, j) {
  if (!query.h) {
    intersections[i][j].push(query.h ? query.p[0] : query.p[1]);
  }
}

function isTooCloseToHorizontalIntersection(p, queries) {
  return queries.some(w =>
    w.some(s => s.some(query => query.h && isTooClose(p, query.p)))
  );
}

function isTooClose(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]) < mismatchThreshold;
}

function sortIntersections(segmentIntersections, points, segmentIndex) {
  const a = points[segmentIndex];
  const b = points[segmentIndex + 1];
  const increasing = a[1] === b[1] ? b[0] > a[0] : b[1] > a[1];
  segmentIntersections.sort((a, b) => (increasing ? a - b : b - a));
}

function updateIntersectionsIfChanged(wire, newIntersections) {
  if (!arrayOfArrayEquals(newIntersections, wire.intersections)) {
    return { ...wire, intersections: newIntersections };
  } else {
    return wire;
  }
}

// Returns true if the two given arrays of arrays of numbers are equal.
function arrayOfArrayEquals(u, v) {
  return u.length === v.length && u.every((n, i) => arrayEquals(v[i], n));
}

// Returns true if the two given arrays of numbers are equal.
function arrayEquals(u, v) {
  return u.length === v.length && u.every((n, i) => v[i] === n);
}
