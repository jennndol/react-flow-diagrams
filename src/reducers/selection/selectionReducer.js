import { selectInArea } from "./selectInArea";
import { moveSelection } from "./moveSelection";
import { selectNext } from "./selectNext";
import { syncConnectorSelection } from "./syncConnectorSelection";
import { findIntersections } from "../helpers/findIntersections";
import { copy, paste } from "./copySelection";

export const selectionReducer = (state, action) => {
  switch (action.type.slice(2)) {
    case "DELETE_SELECTION":
      return deleteSelection(state);
    case "MOVE_SELECTION":
      return moveSelection(state, action.axis, action.amount);
    case "SELECT_NEXT":
      return selectNext(state);
    case "COPY":
      return copy(state);
    case "PASTE":
      return paste(state);
    default:
      const nodes = state.nodes.map(n => updateSelection(n, action));
      const wires = state.wires.map(w => updateSelection(w, action));
      syncConnectorSelection(nodes, state.wires, wires);
      return { ...state, nodes, wires: findIntersections(wires) };
  }
};

function updateSelection(state, action) {
  switch (action.type.slice(2)) {
    case "SELECT_ALL":
      if (!state.selected) {
        return { ...state, selected: true };
      } else {
        return state;
      }
    case "CLEAR_SELECTION":
      if (state.selected && state.id !== action.id) {
        return { ...state, selected: false };
      } else {
        return state;
      }
    case "UPDATE_SELECTION":
      if (state.id === action.id && state.selected !== action.selected) {
        return { ...state, selected: action.selected };
      } else {
        return state;
      }
    case "SELECT_IN_AREA":
      return selectInArea(state, action.area);
    default:
      return state;
  }
}

function deleteSelection(state) {
  const nodesNotSelected = state.nodes.filter(n => !n.selected);
  const wiresNotSelected = state.wires.filter(w => !w.selected);
  const nodeIds = nodesNotSelected.map(n => n.id);
  const wireIds = wiresNotSelected.map(w => w.id);
  const nodes = nodesNotSelected.map(n =>
    cleanConnectorsOfDeletedWires(n, wireIds)
  );
  const wires = wiresNotSelected.map(w => cleanWireOfDeletedNodes(w, nodeIds));
  return { ...state, nodes, wires: findIntersections(wires) };
}

function cleanConnectorsOfDeletedWires(node, wireIds) {
  const cleanStart = node.startConnectors.some(c => !wireIds.includes(c.id));
  const cleanEnd = node.endConnectors.some(c => !wireIds.includes(c.id));
  if (cleanStart || cleanEnd) {
    const newNode = { ...node };
    if (cleanStart) {
      newNode.startConnectors = node.startConnectors.filter(c =>
        wireIds.includes(c.id)
      );
    }
    if (cleanEnd) {
      newNode.endConnectors = node.endConnectors.filter(c =>
        wireIds.includes(c.id)
      );
    }
    return newNode;
  } else {
    return node;
  }
}

function cleanWireOfDeletedNodes(wire, nodeIds) {
  const cleanStart =
    wire.startNodeId !== null && !nodeIds.includes(wire.startNodeId);
  const cleanEnd = wire.endNodeId !== null && !nodeIds.includes(wire.endNodeId);
  if (cleanStart || cleanEnd) {
    const newWire = { ...wire };
    if (cleanStart) {
      newWire.startNodeId = null;
      newWire.startSide = null;
    }
    if (cleanEnd) {
      newWire.endNodeId = null;
      newWire.endSide = null;
    }
    return newWire;
  } else {
    return wire;
  }
}
