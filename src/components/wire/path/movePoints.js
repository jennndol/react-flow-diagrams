export const moveSegment = (points, i, h, position) => {
  const a = points[i];
  const b = points[i + 1];
  const c = h ? [a[0], position] : [position, a[1]];
  const d = h ? [b[0], position] : [position, b[1]];

  const newPoints = [...points];
  newPoints[i] = c;
  newPoints[i + 1] = d;
  return newPoints;
};

export const getPointToDrag = (points, i, p) => {
  const a = points[i];
  const b = points[i + 1];
  const h = a[1] === b[1];
  if (i === 0) {
    return { i: 2, h };
  } else if (i === points.length - 2) {
    return { i: points.length - 1, h: !h };
  } else {
    const pa = h ? Math.abs(p[0] - a[0]) : Math.abs(p[1] - a[1]);
    const pb = h ? Math.abs(p[0] - b[0]) : Math.abs(p[1] - b[1]);
    if (pa < pb) {
      return { i: i + 1, h: !h };
    } else {
      return { i: i + 2, h };
    }
  }
};

export const movePointRectangular = (points, i, h, newX, newY) => {
  const newPoints = [...points];
  newPoints[i - 1] = h ? [newX, points[i - 1][1]] : [points[i - 1][0], newY];
  newPoints[i] = [newX, newY];
  newPoints[i + 1] = h ? [points[i + 1][0], newY] : [newX, points[i + 1][1]];
  return newPoints;
};
