const threshold = 12;

export const snapPointToPath = (p, points) => {
  let minDistance = threshold;
  let snapPoint;
  for (let i = 0; i < points.length - 1; i++) {
    const aInset = i === 0 ? 15 : 10;
    const bInset = i === points.length - 2 ? 25 : 10;
    const result = pointToLine(p, points[i], points[i + 1], aInset, bInset);
    if (result.distance < minDistance) {
      minDistance = result.distance;
      snapPoint = { p: result.s, i };
    }
  }
  return minDistance < threshold ? snapPoint : null;
};

function pointToLine(p, a, b, aInset, bInset) {
  if (a[1] === b[1]) {
    const c = a[0] < b[0] ? [a[0] + aInset, a[1]] : [b[0] + bInset, b[1]];
    const d = a[0] < b[0] ? [b[0] - bInset, b[1]] : [a[0] - aInset, a[1]];
    if (p[0] < c[0]) {
      return { distance: Math.hypot(p[0] - c[0], p[1] - c[1]), s: c };
    } else if (p[0] < d[0]) {
      return { distance: Math.abs(p[1] - c[1]), s: [p[0], c[1]] };
    } else {
      return { distance: Math.hypot(p[0] - d[0], p[1] - d[1]), s: d };
    }
  } else {
    const c = a[1] < b[1] ? [a[0], a[1] + aInset] : [b[0], b[1] + bInset];
    const d = a[1] < b[1] ? [b[0], b[1] - bInset] : [a[0], a[1] - aInset];
    if (p[1] < c[1]) {
      return { distance: Math.hypot(p[0] - c[0], p[1] - c[1]), s: c };
    } else if (p[1] < d[1]) {
      return { distance: Math.abs(p[0] - c[0]), s: [c[0], p[1]] };
    } else {
      return { distance: Math.hypot(p[0] - d[0], p[1] - d[1]), s: d };
    }
  }
}
