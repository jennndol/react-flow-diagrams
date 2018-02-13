export const getRelativePointOnNode = (node, position, side) => {
  if (side === "left") {
    return [0, Math.floor(node.height * position)];
  } else if (side === "right") {
    return [node.width, Math.floor(node.height * position)];
  } else if (side === "top") {
    return [Math.floor(node.width * position), 0];
  } else if (side === "bottom") {
    return [Math.floor(node.width * position), node.height];
  }
};

export const getAbsolutePointOnNode = (node, position, side) => {
  const relative = getRelativePointOnNode(node, position, side);
  return [node.x + relative[0], node.y + relative[1]];
};
