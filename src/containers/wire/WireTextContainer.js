import WireTextComponent from '../../components/wire/WireTextComponent'
import { connect } from 'react-redux'
import { handleSelectionOnPress, handleSelectionOnRelease, handleSelectionOnClick } from '../helpers/handleSelection';
import { startTextEditing, finishAnyTextEditing, onTextChange } from '../../actions/textActions';
import { beginUserAction, completeUserAction } from '../../actions/undoActions';

const mapStateToProps = (state, props) => ({
  wire: props.wire,
  index: props.index,
});

const mapDispatchToProps = (dispatch, props) => ({
  onPress: shortcutDown => {
    if (!props.wire.textEditable) {
      dispatch(finishAnyTextEditing());
    }
    handleSelectionOnPress(dispatch, props.wire, shortcutDown);
  },
  onRelease: shortcutDown => handleSelectionOnRelease(dispatch, props.wire, shortcutDown),
  onClick: shortcutDown => handleSelectionOnClick(dispatch, props.wire, shortcutDown),
  startTextEditing: () => {
    if (!props.wire.textEditable) {
      dispatch(finishAnyTextEditing());
      dispatch(beginUserAction());
      dispatch(startTextEditing(props.wire.id));
    }
  },
  onTextChange: editorState => {
    dispatch(onTextChange(props.wire.id, editorState));
  },
  onTextEditFinished: () => dispatch(completeUserAction('ID', props.wire.id)),
});

const WireTextContainer = connect(mapStateToProps, mapDispatchToProps)(WireTextComponent);

export default WireTextContainer; 