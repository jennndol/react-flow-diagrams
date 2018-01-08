import { connect } from 'react-redux';
import { selectAll, clearSelection, deleteSelection, moveSelection, selectNext, copy, paste } from '../actions/selectionActions';
import { setWireCreationOn, setSnapAllowed } from '../actions/globalActions';
import { addNode, addNodeAndConnect, addFirstNode } from '../actions/nodeActions';
import { beginUserAction, completeUserAction, undo, redo } from '../actions/undoActions';
import { enoughSpaceToAdd } from '../reducers/node/addNodeAndConnect';
import { startTextEditing, finishAnyTextEditing } from '../actions/textActions';
import { canPaste } from '../reducers/selection/copySelection';
import GraphComponent from '../components/GraphComponent';

const mapStateToProps = state => ({
  nodes: state.present.nodes,
  wires: state.present.wires,
  currentlyEdited: state.present.currentlyEdited,
  wireCreationOn: state.present.wireCreationOn,
  snapAllowed: state.present.snapAllowed,
  dragStatus: state.present.dragStatus,
});

const mapDispatchToProps = dispatch => ({
  onKeyDown: (event, props) => {
    const shortcutDown = event.metaKey || event.ctrlKey;
    if (props.currentlyEdited > -1) {
      if (event.keyCode === 27 || event.keyCode === 9 || (event.keyCode === 13 && !event.shiftKey)) {
        dispatch(finishAnyTextEditing());
      }
      if (event.keyCode !== 9) {
        return;
      }
    }
    if ((event.keyCode === 187 || event.keyCode === 171) && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      dispatch(clearSelection());
      dispatch(beginUserAction());
      dispatch(addNode());
      dispatch(completeUserAction('SELECTION_AFTER'));
    } else if (shortcutDown && event.keyCode === 65) {
      dispatch(selectAll());
      event.preventDefault();
    } else if (event.keyCode === 46 || event.keyCode === 8) {
      dispatch(beginUserAction());
      dispatch(deleteSelection());
      dispatch(completeUserAction('SELECTION_BEFORE'));
      if (event.keyCode === 8) {
        event.preventDefault();
      }
    } else if (event.keyCode === 16 && !props.wireCreationOn) {
      dispatch(setWireCreationOn(true));
    } else if (event.keyCode === 18 && props.snapAllowed) {
      dispatch(setSnapAllowed(false));
    } else if (shortcutDown && event.keyCode === 90 && !event.shiftKey) {
      dispatch(undo());
      event.preventDefault();
    } else if (shortcutDown && (event.keyCode === 89 || (event.shiftKey && event.keyCode === 90))) {
      dispatch(redo());
      event.preventDefault();
    } else if (event.keyCode === 39 && !shortcutDown) {
      handleArrowKey('east', dispatch, event, props);
    } else if (event.keyCode === 37 && !shortcutDown) {
      handleArrowKey('west', dispatch, event, props);
    } else if (event.keyCode === 40 && !shortcutDown) {
      handleArrowKey('south', dispatch, event, props);
    } else if (event.keyCode === 38 && !shortcutDown) {
      handleArrowKey('north', dispatch, event, props);
    } else if (event.keyCode === 27) {
      dispatch(clearSelection());
    } else if (event.keyCode === 9 && !event.altKey && !shortcutDown && !event.shiftKey) {
      dispatch(selectNext());
      event.preventDefault();
    } else if (event.keyCode === 88 && shortcutDown) {
      dispatch(copy());
      dispatch(beginUserAction());
      dispatch(deleteSelection());
      dispatch(completeUserAction('SELECTION_BEFORE'));
    } else if (event.keyCode === 67 && shortcutDown) {
      dispatch(copy());
    } else if (event.keyCode === 86 && shortcutDown && canPaste()) {
      dispatch(clearSelection());
      dispatch(beginUserAction());
      dispatch(paste());
      dispatch(completeUserAction('SELECTION_AFTER'));
    } else if (!event.ctrlKey && !event.metaKey && !event.altKey) {
      const enterPressed = event.keyCode === 13;
      if (isAlphaNumeric(event.keyCode) || enterPressed) {
        if (enterPressed) {
          event.preventDefault();
        }
        const singleSelection = getSingleSelection(props.nodes, props.wires);
        if (singleSelection) {
          dispatch(clearSelection(singleSelection.id));
          dispatch(beginUserAction());
          dispatch(startTextEditing(singleSelection.id));
        }
      }
    }
  },
  onKeyUp: (event, props) => {
    if (event.keyCode === 18 && !props.snapAllowed) {
      dispatch(setSnapAllowed(true));
    } else if (event.keyCode === 16 && props.wireCreationOn) {
      dispatch(setWireCreationOn(false));
    }
  },
  onMouseDown: (event, props) => {
    dispatch(finishAnyTextEditing());
    if (event.button === 0 && !event.ctrlKey && !event.metaKey) {
      dispatch(clearSelection());
    } else if (event.button !== 0 && props.wireCreationOn) {
      dispatch(setWireCreationOn(false));
    }
  },
  onBlur: () => {
    dispatch(finishAnyTextEditing());
    dispatch(setWireCreationOn(false));
    dispatch(setSnapAllowed(true));
    document.getElementById('graph').focus();
  },
  onLoad: () => dispatch(addFirstNode()),
});

function isAlphaNumeric(keyCode) {
  return (keyCode >= 48 && keyCode <= 57) || (keyCode >= 65 && keyCode <= 90);
}

function getSingleSelection(nodes, wires) {
  const selectedNodes = nodes.filter(n => n.selected);
  const selectedWires = wires.filter(w => w.selected);
  if (selectedNodes.length === 1) {
    return selectedNodes[0];
  }
  if (selectedNodes.length === 0 && selectedWires.length === 1) {
    return selectedWires[0];
  }
  return null;
}

function handleArrowKey(direction, dispatch, event, props) {
  event.preventDefault();
  if (props.wireCreationOn) {
    dispatch(setWireCreationOn(false));
  }
  if (event.shiftKey) {
    const singleSelection = getSingleSelection(props.nodes, []);
    if (singleSelection && enoughSpaceToAdd(props.nodes, singleSelection.id, direction)) {
      dispatch(beginUserAction());
      dispatch(clearSelection());
      dispatch(addNodeAndConnect(singleSelection.id, direction));
      dispatch(completeUserAction('SELECTION_AFTER'));
    }
  } else {
    dispatch(beginUserAction());
    const axis = (direction === 'east' || direction === 'west') ? 'x' : 'y';
    const multiplier = (direction === 'east' || direction === 'south' ? 1 : -1);
    dispatch(moveSelection(axis, multiplier * (event.altKey ? 1 : 10)));
    dispatch(completeUserAction('SELECTION_BEFORE'));
  }
}

const GraphContainer = connect(mapStateToProps, mapDispatchToProps)(GraphComponent);

export default GraphContainer;