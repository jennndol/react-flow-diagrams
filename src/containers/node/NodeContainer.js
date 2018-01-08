import NodeComponent from '../../components/node/NodeComponent';
import { connect } from 'react-redux';
import { handleSelectionOnPress, handleSelectionOnRelease, handleSelectionOnClick } from '../helpers/handleSelection';
import { prepareNodeDrag, dragNodes, resizeNode } from '../../actions/nodeActions';
import { addWire, dragWire } from '../../actions/wireActions';
import { setDragStatus, clearDragStatus } from '../../actions/globalActions';
import { startTextEditing, onTextChange, finishAnyTextEditing } from '../../actions/textActions';
import { beginUserAction, completeUserAction, discardUserAction } from '../../actions/undoActions';
import { clearSelection } from '../../actions/selectionActions';

const mapStateToProps = (state, props) => ({
  node: props.node,
  wireCreationOn: state.present.wireCreationOn,
  dragStatus: state.present.dragStatus,
  anyTextEdited: state.present.currentlyEdited > 0,
});

const mapDispatchToProps = (dispatch, props) => ({
  onPress: shortcutDown => {
    if (!props.node.textEditable) {
      dispatch(finishAnyTextEditing());
    }
    handleSelectionOnPress(dispatch, props.node, shortcutDown);
    dispatch(prepareNodeDrag(props.node.id));
  },
  onDrag: (dX, dY, firstDrag) => {
    if (firstDrag) {
      dispatch(finishAnyTextEditing());
      dispatch(beginUserAction());
      // When drag is in progress the node will be mouse-transparent. So we set it on the first
      // drag rather than on press, otherwise the node wouldn't respond to double-clicks.
      dispatch(setDragStatus('node', props.node.id, -1, 'inherit'));
    }
    dispatch(dragNodes(props.node.id, dX, dY));
  },
  onRelease: (shortcutDown, dragOccurred) => {
    handleSelectionOnRelease(dispatch, props.node, shortcutDown);
    dispatch(clearDragStatus());
    if (dragOccurred) {
      dispatch(completeUserAction('SELECTION_AFTER'));
    }
  },
  onClick: shortcutDown => handleSelectionOnClick(dispatch, props.node, shortcutDown),
  onResizerPress: (resizeDirection, cursor) => {
    dispatch(finishAnyTextEditing());
    dispatch(beginUserAction());
    dispatch(setDragStatus(resizeDirection, props.node.id, -1, cursor));
  },
  onResize: (x, y, w, h, directions) => dispatch(resizeNode(props.node.id, x, y, w, h, directions)),
  onResizerRelease: resizeOccurred => {
    dispatch(clearDragStatus());
    dispatch(resizeOccurred ? completeUserAction('ID', props.node.id) : discardUserAction());
  },
  onConnectorDragStart: (id, start) => {
    dispatch(finishAnyTextEditing());
    dispatch(beginUserAction());
    dispatch(setDragStatus(start ? 'wire-start' : 'wire-end', id, -1, 'pointer'));
  },
  onConnectorDrag: (id, point, start) => dispatch(dragWire(id, point, start, true)),
  onConnectorDragEnd: (id, start, connectorChanged) => {
    dispatch(clearDragStatus());
    dispatch(connectorChanged ? completeUserAction('ID', id) : discardUserAction());
  },
  onWireCreationStart: (startPos, point, startSide) => {
    dispatch(clearSelection());
    dispatch(beginUserAction());
    dispatch(addWire(props.node.id, startPos, point, startSide));
  },
  onWireCreated: id => dispatch(setDragStatus('wire-end', id, -1, 'pointer')),
  onCreatedWireDrag: (id, point, allowSelfConnect) => dispatch(dragWire(id, point, false, allowSelfConnect)),
  onWireCreationEnd: id => {
    dispatch(clearDragStatus());
    dispatch(completeUserAction('ID', id));
  },
  startTextEditing: () => {
    if (!props.node.textEditable) {
      dispatch(finishAnyTextEditing());
      dispatch(beginUserAction());
      dispatch(startTextEditing(props.node.id));
    }
  },
  onTextChange: editorState => {
    dispatch(onTextChange(props.node.id, editorState));
  },
  onTextEditFinished: () => dispatch(completeUserAction('ID', props.node.id)),
});

const NodeContainer = connect(mapStateToProps, mapDispatchToProps)(NodeComponent);

export default NodeContainer;