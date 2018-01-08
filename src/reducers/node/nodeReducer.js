import { prepareNodeDrag, dragNodes, resizeNode } from './dragNodes';
import { createNode } from '../helpers/createInitialState';
import { syncWiresOnNodeDrag, syncWiresOnNodeResize } from './syncWires';
import { getSnapGuides } from './snapBoxToBox';
import { findIntersections } from '../helpers/findIntersections';
import { addNodeAndConnect } from './addNodeAndConnect';
import { addFirstNode } from './addFirstNode';

export const nodeReducer = (state, action) => {
  switch (action.type.slice(2)) {
    case 'PREPARE_NODE_DRAG':
      prepareNodeDrag(state.nodes);
      return state;
    case 'DRAG_NODES':
      const draggedNodes = dragNodes(state.nodes, state.snapAllowed, action.id, action.dX, action.dY);
      const draggedNode = draggedNodes.filter(n => n.id === action.id)[0];
      const stationaryNodes = draggedNodes.filter(n => !n.selected && n.id !== action.id);
      const snapGuidesAfterDrag = state.snapAllowed ? getSnapGuides(draggedNode, stationaryNodes) : state.snapGuides;
      const wiresAfterNodeDrag = findIntersections(syncWiresOnNodeDrag(state.wires, draggedNodes));
      return { ...state, nodes: draggedNodes, wires: wiresAfterNodeDrag, snapGuides: snapGuidesAfterDrag };
    case 'RESIZE_NODE':
      const otherNodes = state.nodes.filter(n => n.id !== action.id);
      const resizedNodes = state.nodes.map(n => n.id === action.id ? resizeNode(n, state.snapAllowed, otherNodes, action) : n);
      const resizedNode = resizedNodes.filter(n => n.id === action.id)[0];
      const snapGuidesAfterResize = state.snapAllowed ? getSnapGuides(resizedNode, otherNodes, action.directions) : state.snapGuides;
      const wiresAfterNodeResize = findIntersections(syncWiresOnNodeResize(state.wires, resizedNodes, action.id));
      return { ...state, nodes: resizedNodes, wires: wiresAfterNodeResize, snapGuides: snapGuidesAfterResize };
    case 'ADD_NODE':
      return { ...state, nodes: [...state.nodes, createNode(50, 50, 150, 100, true)] };
    case 'ADD_NODE_AND_CONNECT':
      return addNodeAndConnect(state, action.id, action.direction);
    case 'ADD_FIRST_NODE':
      return addFirstNode(state);
    default:
      return state;
  }
}