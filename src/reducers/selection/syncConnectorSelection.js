export const syncConnectorSelection = (nodes, oldWires, newWires) => {
  for (let wire of newWires) {
    const wireChanged = oldWires.indexOf(wire) < 0;
    if (wireChanged && wire.startNodeId !== null) {
      syncConnectorSelectionForNode(nodes, wire.startNodeId, wire);
    }
    if (
      wireChanged &&
      wire.endNodeId !== null &&
      wire.endNodeId !== wire.startNodeId
    ) {
      syncConnectorSelectionForNode(nodes, wire.endNodeId, wire);
    }
  }
};

function syncConnectorSelectionForNode(nodes, nodeId, wire) {
  const index = nodes.findIndex(n => n.id === nodeId);
  nodes[index] = Object.assign({}, nodes[index]);
  nodes[index].startConnectors
    .filter(c => c.id === wire.id)
    .forEach(c => (c.selected = wire.selected));
  nodes[index].endConnectors
    .filter(c => c.id === wire.id)
    .forEach(c => (c.selected = wire.selected));
}
