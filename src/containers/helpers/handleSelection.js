import {
  clearSelection,
  updateSelection
} from "../../actions/selectionActions";

let selectedAtPress = false;

export const handleSelectionOnPress = (dispatch, element, shortcutDown) => {
  if (shortcutDown && !element.selected) {
    dispatch(updateSelection(element.id, true));
    selectedAtPress = true;
  } else if (!element.selected) {
    dispatch(clearSelection());
    dispatch(updateSelection(element.id, true));
    selectedAtPress = true;
  }
};

export const handleSelectionOnRelease = (dispatch, element, shortcutDown) => {
  if (shortcutDown && !selectedAtPress) {
    dispatch(updateSelection(element.id, false));
  }
  selectedAtPress = false;
};

export const handleSelectionOnClick = (dispatch, element, shortcutDown) => {
  if (!shortcutDown && element.selected) {
    dispatch(clearSelection(element.id));
  }
};
