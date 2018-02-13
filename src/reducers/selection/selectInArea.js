export const selectInArea = (element, area) => {
  if (!element.selected && isContainedInArea(element, area)) {
    return { ...element, selected: true };
  } else {
    return element;
  }
};

function isContainedInArea(element, area) {
  if (
    typeof element.width !== "undefined" &&
    typeof element.height !== "undefined"
  ) {
    return isNodeContainedInArea(element, area);
  } else if (typeof element.points !== "undefined") {
    return isWireContainedInArea(element, area);
  } else {
    return false;
  }
}

function isNodeContainedInArea(node, area) {
  const xOk = node.x >= area.x && node.x + node.width < area.x + area.width;
  const yOk = node.y >= area.y && node.y + node.height < area.y + area.height;
  return xOk && yOk;
}

function isWireContainedInArea(wire, area) {
  for (let point of wire.points) {
    const xOk = point[0] >= area.x && point[0] <= area.x + area.width;
    const yOk = point[1] >= area.y && point[1] <= area.y + area.height;
    if (!xOk || !yOk) {
      return false;
    }
  }
  return true;
}
