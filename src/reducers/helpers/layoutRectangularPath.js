const extension = 30;
const buffer = 30;

export const layoutRectangularPath = (
  start,
  end,
  startBox,
  endBox,
  startSide,
  endSide
) => {
  let points;
  if (startSide === null && endSide === null) {
    points = direct(start, end, startSide, endSide);
  } else if (startBox === endBox) {
    points = sameStartAndEnd(start, end, startBox, startSide, endSide);
  } else if (isAnyEndObscured(start, end, startBox, endBox)) {
    points = direct(start, end, startSide, endSide);
  } else if (startSide === null) {
    points = startSideFree(start, end, endBox, endSide);
  } else if (endSide === null) {
    points = endSideFree(start, end, startBox, startSide);
  } else if (isAnyEndObscured(start, end, startBox, endBox)) {
    points = direct(start, end, startSide, endSide);
  } else if (areSidesOpposite(startSide, endSide)) {
    points = oppositeSides(start, end, startBox, endBox, startSide, endSide);
  } else if (startSide === endSide) {
    points = sameSides(start, end, startBox, endBox, startSide, endSide);
  } else {
    points = perpendicularSides(
      start,
      end,
      startBox,
      endBox,
      startSide,
      endSide
    );
  }
  return [start].concat(points).concat([end]);
};

// --- Simple direct path. ---

function direct(start, end, startSide, endSide) {
  const h =
    startSide !== null
      ? isHorizontal(startSide)
      : endSide !== null ? isHorizontal(endSide) : true;
  if (
    value(start, h) === value(end, h) ||
    value(start, !h) === value(end, !h)
  ) {
    return [];
  } else if (
    startSide === null ||
    endSide === null ||
    startSide === endSide ||
    areSidesOpposite(startSide, endSide)
  ) {
    return addTwoPoints(start, end, mid(start, end, h), h);
  } else {
    return addOnePoint(start, end, h);
  }
}

// --- Start and end boxes are the same. ---

function sameStartAndEnd(start, end, box, startSide, endSide) {
  const h = isHorizontal(startSide);
  if (start[0] === end[0] && start[1] === end[1]) {
    return direct(start, end, startSide, endSide);
  } else if (startSide === endSide) {
    return addTwoPoints(start, end, extend(start, startSide), h);
  } else if (areSidesOpposite(startSide, endSide)) {
    if (
      oppositeSidesShortPathIsOuter(start, end, box, box, startSide, endSide)
    ) {
      return oppositeSidesLoopOuter(start, end, box, box, startSide, endSide);
    } else {
      return oppositeSidesLoopInner(start, end, box, box, startSide, endSide);
    }
  } else {
    return addThreePoints(
      start,
      end,
      extend(start, startSide),
      extend(end, endSide),
      h
    );
  }
}

// --- One side is null ---

function endSideFree(start, end, startBox, startSide) {
  const h = isHorizontal(startSide);
  const d = delta(start, end, h, isOuter(startSide));
  if (
    d > 2 * extension ||
    (d > 0 && endIntersectsStartBoxTransverse(end, startBox, startSide))
  ) {
    return direct(start, end, startSide, startSide);
  } else if (d > 0) {
    return addTwoPoints(start, end, extend(start, startSide), h);
  } else {
    const lowerLimit = boxEdge(startBox, !h, false) - extension;
    const upperLimit = boxEdge(startBox, !h, true) + extension;
    const endTransverse = value(end, !h);
    if (endTransverse > lowerLimit && endTransverse < upperLimit) {
      const lowerDistance = value(start, !h) + endTransverse - 2 * lowerLimit;
      const upperDistance = 2 * upperLimit - value(start, !h) - endTransverse;
      const mid = lowerDistance <= upperDistance ? lowerLimit : upperLimit;
      return addThreePoints(start, end, extend(start, startSide), mid, h);
    } else {
      return addTwoPoints(start, end, extend(start, startSide), h);
    }
  }
}

function startSideFree(start, end, endBox, endSide) {
  return endSideFree(end, start, endBox, endSide).reverse();
}

function endIntersectsStartBoxTransverse(end, startBox, startSide) {
  const h = !isHorizontal(startSide);
  const greaterThanMin = value(end, h) >= boxEdge(startBox, h, false);
  const lessThanMax = value(end, h) <= boxEdge(startBox, h, true);
  return greaterThanMin && lessThanMax;
}

// --- Opposite-side paths e.g. right to left, bottom to top, etc. ---

function oppositeSides(start, end, startBox, endBox, startSide, endSide) {
  const deltaFromStart = delta(
    start,
    end,
    isHorizontal(startSide),
    isOuter(startSide)
  );
  if (deltaFromStart > buffer) {
    return direct(start, end, startSide, endSide);
  } else if (
    oppositeSidesTransverseGapLargeEnough(startBox, endBox, startSide, endSide)
  ) {
    return oppositeSidesDoublingBack(
      start,
      end,
      startBox,
      endBox,
      startSide,
      endSide
    );
  } else if (deltaFromStart > 0) {
    return direct(start, end, startSide, endSide);
  } else if (
    oppositeSidesShortPathIsOuter(
      start,
      end,
      startBox,
      endBox,
      startSide,
      endSide
    )
  ) {
    return oppositeSidesLoopOuter(
      start,
      end,
      startBox,
      endBox,
      startSide,
      endSide
    );
  } else {
    return oppositeSidesLoopInner(
      start,
      end,
      startBox,
      endBox,
      startSide,
      endSide
    );
  }
}

function oppositeSidesTransverseGapLargeEnough(
  startBox,
  endBox,
  startSide,
  endSide
) {
  const h = !isHorizontal(startSide);
  const innerGap =
    boxEdge(endBox, h, false) - boxEdge(startBox, h, true) > buffer;
  const outerGap =
    boxEdge(startBox, h, false) - boxEdge(endBox, h, true) > buffer;
  return innerGap || outerGap;
}

function oppositeSidesDoublingBack(
  start,
  end,
  startBox,
  endBox,
  startSide,
  endSide
) {
  const h = isHorizontal(startSide);
  const x = extend(start, startSide);
  const y = boxMid(startBox, endBox, !h);
  const z = extend(end, endSide);
  return addFourPoints(start, end, x, y, z, h);
}

function oppositeSidesShortPathIsOuter(
  start,
  end,
  startBox,
  endBox,
  startSide,
  endSide
) {
  const h = !isHorizontal(startSide);
  const startTransverse = value(start, h);
  const endTransverse = value(end, h);
  const outerDistance =
    2 * extreme(startBox, endBox, h, true) - startTransverse - endTransverse;
  const innerDistance =
    startTransverse + endTransverse - 2 * extreme(startBox, endBox, h, false);
  return outerDistance <= innerDistance;
}

function oppositeSidesLoopOuter(
  start,
  end,
  startBox,
  endBox,
  startSide,
  endSide
) {
  const h = isHorizontal(startSide);
  const endNodeIsObstructing = boxEdge(endBox, !h, true) > value(start, !h);
  const startNodeIsObstructing = boxEdge(startBox, !h, true) > value(end, !h);
  const x = endNodeIsObstructing
    ? extreme(startBox, endBox, h, isOuter(startSide))
    : extend(start, startSide);
  const y = extreme(startBox, endBox, !h, true);
  const z = startNodeIsObstructing
    ? extreme(startBox, endBox, h, isOuter(endSide))
    : extend(end, endSide);
  return addFourPoints(start, end, x, y, z, h);
}

function oppositeSidesLoopInner(
  start,
  end,
  startBox,
  endBox,
  startSide,
  endSide
) {
  const h = isHorizontal(startSide);
  const endNodeIsObstructing = boxEdge(endBox, !h, false) < value(start, !h);
  const startNodeIsObstructing = boxEdge(startBox, !h, false) < value(end, !h);
  const x = endNodeIsObstructing
    ? extreme(startBox, endBox, h, isOuter(startSide))
    : extend(start, startSide);
  const y = extreme(startBox, endBox, !h, false);
  const z = startNodeIsObstructing
    ? extreme(startBox, endBox, h, isOuter(endSide))
    : extend(end, endSide);
  return addFourPoints(start, end, x, y, z, h);
}

// --- Same-side paths e.g. right to right, bottom to bottom, etc. ---

function sameSides(start, end, startBox, endBox, startSide, endSide) {
  const h = isHorizontal(startSide);
  const bendsBackFromStart =
    isOuter(startSide) === value(start, h) > boxEdge(endBox, h, true);
  if (
    sameSidesSimpleBendIsPossible(
      bendsBackFromStart,
      start,
      end,
      startBox,
      endBox,
      startSide
    )
  ) {
    return addTwoPoints(
      start,
      end,
      extreme(startBox, endBox, h, isOuter(startSide)),
      h
    );
  } else if (bendsBackFromStart) {
    return sameSidesLoopAroundBendingBackFromStart(
      start,
      end,
      startBox,
      endBox,
      startSide
    );
  } else {
    return sameSidesLoopAroundBendingBackFromEnd(
      start,
      end,
      startBox,
      endBox,
      startSide
    );
  }
}

function sameSidesSimpleBendIsPossible(
  bendsBackFromStart,
  start,
  end,
  startBox,
  endBox,
  startSide
) {
  const h = isHorizontal(startSide);
  if (bendsBackFromStart) {
    if (value(end, h) < value(start, h) !== isOuter(startSide)) {
      return true;
    } else {
      return (
        boxEdge(startBox, !h, false) > value(end, !h) ||
        boxEdge(startBox, !h, true) < value(end, !h)
      );
    }
  } else {
    return (
      boxEdge(endBox, !h, false) > value(start, !h) ||
      boxEdge(endBox, !h, true) < value(start, !h)
    );
  }
}

function sameSidesLoopAroundBendingBackFromStart(
  start,
  end,
  startBox,
  endBox,
  startSide
) {
  const h = isHorizontal(startSide);
  const x = extend(start, startSide);
  const startMaxPlusMin =
    boxEdge(startBox, !h, true) + boxEdge(startBox, !h, false);
  let y;
  if (startMaxPlusMin <= value(start, !h) + value(end, !h) + 1) {
    y = boxEdge(startBox, !h, true) + extension;
  } else {
    y = boxEdge(startBox, !h, false) - extension;
  }
  const z = boxMid(startBox, endBox, h);
  return addFourPoints(start, end, x, y, z, h);
}

function sameSidesLoopAroundBendingBackFromEnd(
  start,
  end,
  startBox,
  endBox,
  startSide
) {
  const h = isHorizontal(startSide);
  const x = boxMid(startBox, endBox, h);
  const endMaxPlusMin = boxEdge(endBox, !h, true) + boxEdge(endBox, !h, false);
  let y;
  if (endMaxPlusMin <= value(end, !h) + value(start, !h) + 1) {
    y = boxEdge(endBox, !h, true) + extension;
  } else {
    y = boxEdge(endBox, !h, false) - extension;
  }
  const z = extend(end, startSide);
  return addFourPoints(start, end, x, y, z, h);
}

// --- Perpendicular-side paths e.g. right to bottom, top to left, etc. ---

function perpendicularSides(start, end, startBox, endBox, startSide, endSide) {
  const h = isHorizontal(startSide);
  if (perpendicularSidesDirectIsPossible(start, end, startSide, endSide)) {
    return addOnePoint(start, end, h);
  } else if (perpendicularSidesFitsBetweenBoxes(start, endBox, startSide)) {
    const x = boxMid(startBox, endBox, h);
    const y = extend(end, endSide);
    return addThreePoints(start, end, x, y, h);
  } else if (perpendicularSidesFitsBetweenBoxes(end, startBox, endSide)) {
    const x = extend(start, startSide);
    const y = boxMid(startBox, endBox, !h);
    return addThreePoints(start, end, x, y, h);
  } else {
    let x, y;
    if (perpendicularSidesIsEndNodeObstructing(start, end, endSide)) {
      x = extreme(startBox, endBox, h, isOuter(startSide));
    } else {
      x = extend(start, startSide);
    }
    if (perpendicularSidesIsStartNodeObstructing(start, end, startSide)) {
      y = extreme(startBox, endBox, !h, isOuter(endSide));
    } else {
      y = extend(end, endSide);
    }
    return addThreePoints(start, end, x, y, h);
  }
}

function perpendicularSidesDirectIsPossible(start, end, startSide, endSide) {
  const h = isHorizontal(startSide);
  return (
    delta(start, end, h, isOuter(startSide)) > 0 &&
    delta(start, end, !h, isOuter(endSide)) < 0
  );
}

function perpendicularSidesFitsBetweenBoxes(point, box, pointSide) {
  const h = isHorizontal(pointSide);
  let pointAxisOk;
  if (isOuter(pointSide)) {
    pointAxisOk = boxEdge(box, h, false) > value(point, h);
  } else {
    pointAxisOk = boxEdge(box, h, true) < value(point, h);
  }
  const pointTransverseAxisMaxOk =
    value(point, !h) < boxEdge(box, !h, true) + extension;
  const pointTransverseAxisMinOk =
    value(point, !h) > boxEdge(box, !h, false) - extension;

  if (pointAxisOk && pointTransverseAxisMaxOk && pointTransverseAxisMinOk) {
    return true;
  } else {
    if (isOuter(pointSide)) {
      return boxEdge(box, h, false) - value(point, h) > buffer;
    } else {
      return value(point, h) - boxEdge(box, h, true) > buffer;
    }
  }
}

function perpendicularSidesIsEndNodeObstructing(start, end, endSide) {
  const h = isHorizontal(endSide);
  return isOuter(endSide)
    ? value(end, h) > value(start, h)
    : value(end, h) < value(start, h);
}

function perpendicularSidesIsStartNodeObstructing(start, end, startSide) {
  const h = isHorizontal(startSide);
  return isOuter(startSide)
    ? value(start, h) > value(end, h)
    : value(start, h) < value(end, h);
}

// --- Question methods. ---

function isAnyEndObscured(start, end, startBox, endBox) {
  return (
    (startBox && isContained(end, startBox)) ||
    (endBox && isContained(start, endBox))
  );
}

function isContained(point, box) {
  const xInside = point[0] >= box.x && point[0] <= box.x + box.width;
  const yInside = point[1] >= box.y && point[1] <= box.y + box.height;
  return xInside && yInside;
}

function areSidesOpposite(startSide, endSide) {
  const horizontal =
    (startSide === "left" && endSide === "right") ||
    (startSide === "right" && endSide === "left");
  const vertical =
    (startSide === "top" && endSide === "bottom") ||
    (startSide === "bottom" && endSide === "top");
  return horizontal || vertical;
}

function isOuter(side) {
  return side === "right" || side === "bottom";
}

function isHorizontal(side) {
  return side === "left" || side === "right";
}

// --- Value accessors based on side. ---

function value(point, h) {
  return h ? point[0] : point[1];
}

function mid(start, end, h) {
  return Math.floor((value(start, h) + value(end, h)) / 2);
}

function boxMid(startBox, endBox, h) {
  const startMax = boxEdge(startBox, h, true);
  const endMin = boxEdge(endBox, h, false);
  if (startMax < endMin) {
    return Math.floor((endMin + startMax) / 2);
  } else {
    const startMin = boxEdge(startBox, h, false);
    const endMax = boxEdge(endBox, h, true);
    return Math.floor((startMin + endMax) / 2);
  }
}

function delta(start, end, h, increasing) {
  return (increasing ? 1 : -1) * (value(end, h) - value(start, h));
}

function extend(point, side) {
  return (
    value(point, isHorizontal(side)) + (isOuter(side) ? 1 : -1) * extension
  );
}

function boxEdge(box, h, o) {
  if (h) {
    return o ? box.x + box.width : box.x;
  } else {
    return o ? box.y + box.height : box.y;
  }
}

function extreme(startBox, endBox, h, o) {
  if (o) {
    return Math.max(
      boxEdge(startBox, h, o) + extension,
      boxEdge(endBox, h, o) + extension
    );
  } else {
    return Math.min(
      boxEdge(startBox, h, o) - extension,
      boxEdge(endBox, h, o) - extension
    );
  }
}

// --- Helpers for adding points. ---

function createPoint(newValue, refPoint, h) {
  return h ? [newValue, refPoint[1]] : [refPoint[0], newValue];
}

function addOnePoint(start, end, h) {
  return [createPoint(value(end, h), start, h)];
}

function addTwoPoints(start, end, x, h) {
  const p1 = createPoint(x, start, h);
  const p2 = createPoint(x, end, h);
  return [p1, p2];
}

function addThreePoints(start, end, x, y, h) {
  const p1 = createPoint(x, start, h);
  const p2 = createPoint(y, p1, !h);
  const p3 = createPoint(y, end, !h);
  return [p1, p2, p3];
}

function addFourPoints(start, end, x, y, z, h) {
  const p1 = createPoint(x, start, h);
  const p2 = createPoint(y, p1, !h);
  const p3 = createPoint(z, p2, h);
  const p4 = createPoint(z, end, h);
  return [p1, p2, p3, p4];
}
