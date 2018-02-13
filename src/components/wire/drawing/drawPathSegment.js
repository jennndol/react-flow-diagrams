let arcRadius = 5;
let mergeThreshold = 16;

export const drawHorizontalSegment = (a, b, intersections) => {
  let path = "";
  if (intersections && intersections.length > 0) {
    const y = a[1];
    const s = b[0] > a[0] ? 1 : -1;
    path += hLineTo(intersections[0] - s * arcRadius);
    path += arcTo(intersections[0], y - arcRadius, s);

    for (var i = 1; i < intersections.length; i++) {
      const intersection = intersections[i];
      const lastIntersection = intersections[i - 1];
      if (Math.abs(intersection - lastIntersection) <= mergeThreshold) {
        path += hLineTo(intersection);
      } else {
        path += arcTo(lastIntersection + s * arcRadius, y, s);
        path += hLineTo(intersection - s * arcRadius);
        path += arcTo(intersection, y - arcRadius, s);
      }
    }
    path += arcTo(
      intersections[intersections.length - 1] + s * arcRadius,
      y,
      s
    );
  }
  path += hLineTo(b[0]);
  return path;
};

export const drawVerticalSegment = (a, b, intersections) => {
  let path = "";
  if (intersections && intersections.length > 0) {
    const x = a[0];
    const s = b[1] > a[1] ? 1 : -1;
    path += vLineTo(intersections[0] - s * arcRadius);
    path += arcTo(x + arcRadius, intersections[0], s);

    for (var i = 1; i < intersections.length; i++) {
      const intersection = intersections[i];
      const lastIntersection = intersections[i - 1];
      if (Math.abs(intersection - lastIntersection) <= mergeThreshold) {
        path += vLineTo(intersection);
      } else {
        path += arcTo(x, lastIntersection + s * arcRadius, s);
        path += vLineTo(intersection - s * arcRadius);
        path += arcTo(x + arcRadius, intersection, s);
      }
    }
    path += arcTo(
      x,
      intersections[intersections.length - 1] + s * arcRadius,
      s
    );
  }
  path += vLineTo(b[1]);
  return path;
};

function hLineTo(x) {
  return ` H ${x}`;
}

function vLineTo(y) {
  return ` V ${y}`;
}

function arcTo(x, y, s) {
  return ` A ${arcRadius} ${arcRadius} 0 0 ${s === 1 ? 1 : 0} ${x} ${y}`;
}
