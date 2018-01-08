import { connect } from 'react-redux'
import WireLayerComponent from '../../components/wire/WireLayerComponent'

const mapStateToProps = state => ({
  wires: state.present.wires,
  wireCreationOn: state.present.wireCreationOn,
});

const WireLayerContainer = connect(mapStateToProps)(WireLayerComponent);

export default WireLayerContainer;