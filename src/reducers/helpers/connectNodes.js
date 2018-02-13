export const connectStart = (node, wire) => {
  const alreadyConnected = node.startConnectors.some(c => c.id === wire.id);
  if (alreadyConnected) {
    const newConnectors = node.startConnectors.map(c => {
      if (c.id === wire.id) {
        const pos = wire.startPos;
        const side = wire.startSide;
        const selected = wire.selected;
        return { ...c, pos, side, selected };
      } else {
        return c;
      }
    });
    node.startConnectors = newConnectors;
  } else {
    const newConnector = {
      id: wire.id,
      pos: wire.startPos,
      side: wire.startSide,
      selected: wire.selected
    };
    node.startConnectors = [...node.startConnectors, newConnector];
  }
  wire.startNodeId = node.id;
};

export const connectEnd = (node, wire) => {
  const alreadyConnected = node.endConnectors.some(c => c.id === wire.id);
  if (alreadyConnected) {
    const newConnectors = node.endConnectors.map(c => {
      if (c.id === wire.id) {
        const pos = wire.endPos;
        const side = wire.endSide;
        const selected = wire.selected;
        return { ...c, pos, side, selected };
      } else {
        return c;
      }
    });
    node.endConnectors = newConnectors;
  } else {
    const newConnector = {
      id: wire.id,
      pos: wire.endPos,
      side: wire.endSide,
      selected: wire.selected
    };
    node.endConnectors = [...node.endConnectors, newConnector];
  }
  wire.endNodeId = node.id;
};

export const connectNodes = (startNode, endNode, wire) => {
  connectStart(startNode, wire);
  connectEnd(endNode, wire);
};
