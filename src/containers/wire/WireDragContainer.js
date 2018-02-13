import { connect } from "react-redux";
import {
  dragWire,
  perturbWire,
  cleanPoints,
  resetWire
} from "../../actions/wireActions";
import { setDragStatus, clearDragStatus } from "../../actions/globalActions";
import { beginUserAction, completeUserAction } from "../../actions/undoActions";
import { finishAnyTextEditing } from "../../actions/textActions";
import WireDragComponent from "../../components/wire/WireDragComponent";

const mapStateToProps = (state, props) => ({
  wire: props.wire,
  dragStatus: state.present.dragStatus
});

const mapDispatchToProps = (dispatch, props) => ({
  startWireDrag: (status, indexOfDraggedPoint, cursor) => {
    dispatch(finishAnyTextEditing());
    dispatch(beginUserAction());
    dispatch(setDragStatus(status, props.wire.id, indexOfDraggedPoint, cursor));
  },
  dragWire: (point, start, allowSelfConnect) =>
    dispatch(dragWire(props.wire.id, point, start, allowSelfConnect)),
  endWireDrag: start => {
    dispatch(clearDragStatus());
    dispatch(cleanPoints(props.wire.id));
    dispatch(completeUserAction("ID", props.wire.id));
  },
  perturbWire: (points, snapInput) =>
    dispatch(perturbWire(props.wire.id, points, snapInput)),
  endWirePerturb: () => {
    dispatch(clearDragStatus());
    dispatch(cleanPoints(props.wire.id));
    dispatch(completeUserAction("ID", props.wire.id));
  },
  resetWire: () => {
    if (props.wire.manualLayout) {
      dispatch(beginUserAction());
      dispatch(resetWire(props.wire.id));
      dispatch(completeUserAction("ID", props.wire.id));
    }
  }
});

const WireDragContainer = connect(mapStateToProps, mapDispatchToProps)(
  WireDragComponent
);

export default WireDragContainer;
