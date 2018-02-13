import { addWire } from "./addWire";
import { dragWire } from "./dragWire";
import { resetWire } from "./resetWire";
import { cleanPoints } from "./cleanPoints";
import { snapPathToPath } from "./snapPathToPath";
import { findIntersections } from "../helpers/findIntersections";

export const wireReducer = (state, action) => {
  switch (action.type.slice(2)) {
    case "ADD_WIRE":
      return addWire(state, action);
    case "DRAG_WIRE":
      const wireToDrag = state.wires.filter(w => w.id === action.id)[0];
      const result = dragWire(
        wireToDrag,
        state.nodes,
        action.point,
        action.start,
        action.allowSelfConnect
      );
      const newWires = state.wires.map(
        w => (w.id === wireToDrag.id ? result.wire : w)
      );
      return {
        ...state,
        nodes: result.nodes,
        wires: findIntersections(newWires)
      };
    case "PERTURB_WIRE":
      const wireToPerturb = state.wires.filter(w => w.id === action.id)[0];
      if (action.snapInput && state.snapAllowed) {
        const otherPoints = state.wires
          .filter(w => w.id !== action.id)
          .map(w => w.points);
        const snapResult = snapPathToPath(
          action.points,
          otherPoints,
          action.snapInput
        );
        const perturbedWire = {
          ...wireToPerturb,
          points: snapResult.points,
          manualLayout: true
        };
        const newWires = state.wires.map(
          w => (w.id === wireToPerturb.id ? perturbedWire : w)
        );
        return {
          ...state,
          wires: findIntersections(newWires),
          snapGuides: snapResult.snapGuides
        };
      } else {
        const perturbedWire = {
          ...wireToPerturb,
          points: action.points,
          manualLayout: true
        };
        const newWires = state.wires.map(
          w => (w.id === wireToPerturb.id ? perturbedWire : w)
        );
        return { ...state, wires: findIntersections(newWires) };
      }
    case "CLEAN_POINTS":
      return {
        ...state,
        wires: findIntersections(
          state.wires.map(w => (w.id === action.id ? cleanPoints(w) : w))
        )
      };
    case "RESET_WIRE":
      return {
        ...state,
        wires: findIntersections(
          state.wires.map(
            w => (w.id === action.id ? resetWire(w, state.nodes) : w)
          )
        )
      };
    case "SET_EXTENSION_IN_PROGRESS":
      return {
        ...state,
        wires: state.wires.map(
          w =>
            w.id === action.id
              ? { ...w, extensionInProgress: action.extensionInProgress }
              : w
        )
      };
    default:
      return state;
  }
};
