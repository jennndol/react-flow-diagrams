export const globalReducer = (state, action) => {
  switch (action.type.slice(2)) {
    case "SET_DRAG_STATUS":
      // Always hide snap-guides if drag ends:
      const newSnapGuides =
        !action.status && state.snapGuides.length > 0 ? [] : state.snapGuides;
      const dragStatus = action.status
        ? {
            status: action.status,
            id: action.id,
            index: action.index,
            cursor: action.cursor
          }
        : null;
      return { ...state, dragStatus, snapGuides: newSnapGuides };
    case "SET_WIRE_CREATION_ON":
      return { ...state, wireCreationOn: action.wireCreationOn };
    case "SET_SNAP_ALLOWED":
      const nextSnapGuides =
        !action.snapAllowed && state.snapGuides.length > 0
          ? []
          : state.snapGuides;
      return {
        ...state,
        snapAllowed: action.snapAllowed,
        snapGuides: nextSnapGuides
      };
    default:
      return state;
  }
};
