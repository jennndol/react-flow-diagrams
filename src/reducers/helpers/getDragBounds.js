const padding = 10;

export const getDragBounds = nodes => {
  const graph = document.getElementById("graph");
  const minX = Math.min(...nodes.map(n => n.x));
  const minY = Math.min(...nodes.map(n => n.y));
  const maxX = Math.max(...nodes.map(n => n.x + n.width));
  const maxY = Math.max(...nodes.map(n => n.y + n.height));
  const minDeltaX = -minX + padding;
  const minDeltaY = -minY + padding;
  const maxDeltaX = graph.clientWidth - maxX - padding;
  const maxDeltaY = graph.clientHeight - maxY - padding;

  return { minDeltaX, minDeltaY, maxDeltaX, maxDeltaY };
};
