import WirePathComponent from '../../components/wire/WirePathComponent'
import { connect } from 'react-redux'
import { handleSelectionOnPress, handleSelectionOnRelease, handleSelectionOnClick } from '../helpers/handleSelection';
import { perturbWire, cleanPoints, setExtensionInProgress } from '../../actions/wireActions';
import { beginUserAction, completeUserAction } from '../../actions/undoActions';
import { setDragStatus, clearDragStatus } from '../../actions/globalActions';
import { startTextEditing, finishAnyTextEditing } from '../../actions/textActions';

const mapStateToProps = (state, props) => ({
  wire: props.wire,
  wireCreationOn: state.present.wireCreationOn,
  anyTextEdited: state.present.currentlyEdited > 0,
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
  startWirePerturb: indexOfAddedPoint => {
    dispatch(beginUserAction());
    dispatch(setDragStatus('wire-perturb', props.wire.id, indexOfAddedPoint, 'inherit'));
  },
  perturbWire: (points, snapInput) => dispatch(perturbWire(props.wire.id, points, snapInput)),
  aboutToEndWirePerturb: () => dispatch(cleanPoints(props.wire.id)),
  endWirePerturb: () => {
    dispatch(clearDragStatus());
    dispatch(completeUserAction('ID', props.wire.id));
  },
  setExtensionInProgress: extensionInProgress => dispatch(setExtensionInProgress(props.wire.id, extensionInProgress)),
  startTextEditing: () => {
    if (!props.wire.textEditable) {
      dispatch(finishAnyTextEditing());
      dispatch(beginUserAction());
      dispatch(startTextEditing(props.wire.id));
    }
  },
});

const WirePathContainer = connect(mapStateToProps, mapDispatchToProps)(WirePathComponent);

export default WirePathContainer;