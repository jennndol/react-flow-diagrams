export const prepareNodeDrag = id => ({ type: 'N/PREPARE_NODE_DRAG', id });

export const dragNodes = (id, dX, dY) => ({ type: 'N/DRAG_NODES', id, dX, dY });

export const resizeNode = (id, x, y, width, height, directions) => ({ type: 'N/RESIZE_NODE', id, x, y, width, height, directions });

export const addNode = () => ({ type: 'N/ADD_NODE' });

export const addNodeAndConnect = (id, direction) => ({ type: 'N/ADD_NODE_AND_CONNECT', id, direction });

export const addFirstNode = () => ({ type: 'N/ADD_FIRST_NODE' });