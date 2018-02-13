import { findIntersections } from "../helpers/findIntersections";
import { syncWiresOnNodeDrag } from "../node/syncWires";
import { getDragBounds } from "../helpers/getDragBounds";

export const moveSelection = (state, axis, amount) => {
  const dragBounds = getDragBounds(state.nodes.filter(n => n.selected));
  const h = axis === "x";
  const minAmount = h ? dragBounds.minDeltaX : dragBounds.minDeltaY;
  const maxAmount = h ? dragBounds.maxDeltaX : dragBounds.maxDeltaY;
  const clampedAmount = Math.max(minAmount, Math.min(maxAmount, amount));

  const nodes = state.nodes.map(
    n => (n.selected ? moveNode(n, h, clampedAmount) : n)
  );
  const wires = syncWiresOnNodeDrag(state.wires, nodes);
  return { ...state, nodes, wires: findIntersections(wires) };
};

function moveNode(node, h, amount) {
  if (h) {
    return { ...node, x: node.x + amount };
  } else {
    return { ...node, y: node.y + amount };
  }
}
