export const cleanPoints = wire => {
  const newPoints = [...wire.points];
  while (newPoints.length > 2) {
    if (!removeFirstEqualVertexPair(newPoints)) {
      break;
    }
  }
  const newWire = { ...wire, points: newPoints };
  if (newPoints.length < 4) {
    newWire.manualLayout = false;
  }
  return newWire.points.length !== wire.points.length ? newWire : wire;
};

function removeFirstEqualVertexPair(points) {
  for (let i = 1; i < points.length - 2; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (a[0] === b[0] && a[1] === b[1]) {
      points.splice(i, 1);
      points.splice(i, 1);
      return true;
    }
  }
  return false;
}
