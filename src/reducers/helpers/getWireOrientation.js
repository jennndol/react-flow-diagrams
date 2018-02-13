export const isStartHorizontal = (startSide, endSide) => {
  if (startSide) {
    return isHorizontal(startSide);
  } else if (endSide) {
    return isHorizontal(endSide);
  } else {
    return true;
  }
};

export const isEndHorizontal = (startSide, endSide) => {
  if (endSide) {
    return isHorizontal(endSide);
  } else if (startSide) {
    return isHorizontal(startSide);
  } else {
    return true;
  }
};

function isHorizontal(side) {
  return side === "left" || side === "right";
}
