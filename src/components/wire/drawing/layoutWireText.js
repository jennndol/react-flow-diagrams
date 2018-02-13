export const layoutWireText = points => {
  return getMidPointAt(points, textIndex(points));
};

function textIndex(points) {
  const segments = points.length - 1;
  if (segments < 2) {
    return 0;
  } else if (segments % 2 !== 0) {
    return (segments - 1) / 2;
  } else {
    const i1 = segments / 2 - 1;
    const i2 = segments / 2;
    const length1 = getLengthAt(points, i1);
    const length2 = getLengthAt(points, i2);
    return length1 > length2 ? i1 : i2;
  }
}

function getLengthAt(points, i) {
  const a = points[i];
  const b = points[i + 1];
  return a[1] === b[1] ? Math.abs(a[0] - b[0]) : Math.abs(a[1] - b[1]);
}

function getMidPointAt(points, index) {
  const a = points[index];
  const b = points[index + 1];
  if (a[1] === b[1]) {
    return [Math.floor((a[0] + b[0]) / 2), a[1]];
  } else {
    return [a[0], Math.floor((a[1] + b[1]) / 2)];
  }
}
