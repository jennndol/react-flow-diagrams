import { connect } from 'react-redux'
import SnapGuideComponent from '../components/SnapGuideComponent'

const mapStateToProps = state => ({
  guides: state.present.snapGuides,
  wires: state.present.wires,
});

const SnapGuideContainer = connect(mapStateToProps)(SnapGuideComponent);

export default SnapGuideContainer;