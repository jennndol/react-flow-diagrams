import { connect } from "react-redux";
import NodeLayerComponent from "../../components/node/NodeLayerComponent";

const mapStateToProps = state => ({
  nodes: state.present.nodes,
  wireCreationOn: state.present.wireCreationOn,
  dragStatus: state.present.dragStatus
});

const NodeLayerContainer = connect(mapStateToProps)(NodeLayerComponent);

export default NodeLayerContainer;
