const snapThreshold = 15;
const targetSnapThreshold = 5;
const cornerInset = 14;
const snapTargets = [0.5];

export const snapToBox = (x, y, box) => {
  const left = x - box.x;
  const right = x - box.x - box.width;
  const top = y - box.y;
  const bottom = y - box.y - box.height;
  const inRangeX = left > -snapThreshold && right < snapThreshold;
  const inRangeY = top > -snapThreshold && bottom < snapThreshold;

  let newX = x;
  let newY = y;
  let snapped = false;
  if (inRangeY && Math.abs(left) < snapThreshold) {
    newX = box.x;
    snapped = true;
  } else if (inRangeY && Math.abs(right) < snapThreshold) {
    newX = box.x + box.width;
    snapped = true;
  }
  if (inRangeX && Math.abs(top) < snapThreshold) {
    newY = box.y;
    snapped = true;
  } else if (inRangeX && Math.abs(bottom) < snapThreshold) {
    newY = box.y + box.height;
    snapped = true;
  }

  // Snap away from corners.
  if (snapped && newX === box.x && newY === box.y) {
    if (
      Math.hypot(left, top - cornerInset) <= Math.hypot(left - cornerInset, top)
    ) {
      newY = box.y + cornerInset;
    } else {
      newX = box.x + cornerInset;
    }
  } else if (snapped && newX === box.x && newY === box.y + box.height) {
    if (
      Math.hypot(left, bottom + cornerInset) <=
      Math.hypot(left - cornerInset, bottom)
    ) {
      newY = box.y + box.height - cornerInset;
    } else {
      newX = box.x + cornerInset;
    }
  } else if (snapped && newX === box.x + box.width && newY === box.y) {
    if (
      Math.hypot(right, top - cornerInset) <=
      Math.hypot(right + cornerInset, top)
    ) {
      newY = box.y + cornerInset;
    } else {
      newX = box.x + box.width - cornerInset;
    }
  } else if (
    snapped &&
    newX === box.x + box.width &&
    newY === box.y + box.height
  ) {
    if (
      Math.hypot(right, bottom + cornerInset) <=
      Math.hypot(right + cornerInset, bottom)
    ) {
      newY = box.y + box.height - cornerInset;
    } else {
      newX = box.x + box.width - cornerInset;
    }
  }

  // Snap to targets.
  let snappedToTarget = false;
  if (snapped && (newX === box.x || newX === box.x + box.width)) {
    for (let target of snapTargets) {
      let targetAbsolute = target * box.height + box.y;
      if (Math.abs(y - targetAbsolute) <= targetSnapThreshold) {
        newY = Math.floor(targetAbsolute);
        snappedToTarget = true;
      }
    }
  }
  if (snapped && (newY === box.y || newY === box.y + box.height)) {
    for (let target of snapTargets) {
      let targetAbsolute = target * box.width + box.x;
      if (Math.abs(x - targetAbsolute) <= targetSnapThreshold) {
        newX = Math.floor(targetAbsolute);
        snappedToTarget = true;
      }
    }
  }

  let snappedSide;
  if (snapped && newX === box.x) {
    snappedSide = "left";
  } else if (snapped && newX === box.x + box.width) {
    snappedSide = "right";
  } else if (snapped && newY === box.y) {
    snappedSide = "top";
  } else if (snapped && newY === box.y + box.height) {
    snappedSide = "bottom";
  } else {
    snappedSide = null;
  }
  return { x: newX, y: newY, snappedSide, snappedToTarget };
};
