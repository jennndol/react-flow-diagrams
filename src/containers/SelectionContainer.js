import { connect } from 'react-redux'
import { selectInArea } from '../actions/selectionActions';
import SelectionComponent from '../components/SelectionComponent'

const mapStateToProps = (state, props) => ({});

const mapDispatchToProps = (dispatch, props) => ({
  selectInArea: area => {
    if (area.width > 0 && area.height > 0) {
      dispatch(selectInArea(area));
    }
  },
});

const SelectionContainer = connect(mapStateToProps, mapDispatchToProps)(SelectionComponent);

export default SelectionContainer;