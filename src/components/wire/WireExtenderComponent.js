import React, { PureComponent } from "react";
import { snapPointToPath } from "./path/snapPointToPath";
import { getPointToDrag, movePointRectangular } from "./path/movePoints";

export default class WireExtenderComponent extends PureComponent {
  state = { snapPoint: null, pathHover: false };
  lastPosition = [0, 0];

  componentDidMount() {
    this.graph = document.getElementById("graph");
    this.pathGrabber = this.rect.parentElement.children[0];
    this.pathGrabber.addEventListener("mouseenter", this.onPathMouseEnter);
    this.pathGrabber.addEventListener("mouseleave", this.onPathMouseExit);
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mousedown", this.onMouseDown, true);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("blur", this.onBlur);
  }

  componentWillUnmount() {
    this.pathGrabber.removeEventListener("mouseenter", this.onPathMouseEnter);
    this.pathGrabber.removeEventListener("mouseleave", this.onPathMouseExit);
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mousedown", this.onMouseDown, true);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("blur", this.onBlur);
  }

  componentWillReceiveProps(nextProps) {
    if (
      !this.props.wireCreationOn &&
      nextProps.wireCreationOn &&
      this.clientX &&
      this.clientY
    ) {
      this.calculateSnapPoint();
    }
  }

  render() {
    const visible =
      !this.props.wire.extensionInProgress &&
      this.isSnapPointShowing() &&
      !this.props.anyTextEdited;
    const className = "wire-extender" + (visible ? " showing" : "");
    const style = {
      visibility: this.props.wire.extensionInProgress ? "hidden" : "visible"
    };
    const p = this.state.snapPoint ? this.state.snapPoint.p : this.lastPosition;
    // Use a path instead of a rect because rect seems to render differently in Chrome & Firefox.
    const d = `M ${p[0]} ${p[1]} h 10 v 10 h -10 z`;
    return (
      <path
        className={className}
        style={style}
        d={d}
        ref={e => (this.rect = e)}
      />
    );
  }

  onMouseMove = event => {
    this.clientX = event.clientX;
    this.clientY = event.clientY;
    if (this.draggedPoint) {
      const deltaX = event.clientX - this.mouseXAtPress;
      const deltaY = event.clientY - this.mouseYAtPress;
      const newX = this.positionAtPress[0] + deltaX;
      const newY = this.positionAtPress[1] + deltaY;
      const i = this.draggedPoint.i;
      const h = this.draggedPoint.h;
      const newPoints = movePointRectangular(
        this.props.wire.points,
        i,
        h,
        newX,
        newY
      );
      this.props.perturbWire(newPoints, { i, axis: "both", h });
    } else if (this.props.wireCreationOn) {
      this.calculateSnapPoint();
    }
  };

  onMouseDown = event => {
    if (
      event.button === 0 &&
      this.isSnapPointShowing() &&
      !this.props.wire.extensionInProgress
    ) {
      const newPoints = [...this.props.wire.points];
      const newPoint = this.state.snapPoint.p;

      const i = this.state.snapPoint.i + 1;
      newPoints.splice(i, 0, [...newPoint]);
      newPoints.splice(i, 0, [...newPoint]);

      if (this.props.wire.points.length === 2) {
        this.insertAdditionalPoint(newPoints, newPoint);
      }

      this.mouseXAtPress = event.clientX;
      this.mouseYAtPress = event.clientY;
      this.positionAtPress = [...newPoint];
      this.draggedPoint = getPointToDrag(
        this.props.wire.points,
        i - 1,
        newPoint
      );
      this.props.startWirePerturb(this.draggedPoint.i);
      this.props.perturbWire(newPoints, null);
      this.props.setExtensionInProgress(true);
    }
  };

  onMouseUp = event => this.onRelease();

  onBlur = () => this.onRelease();

  onRelease = () => {
    if (this.draggedPoint) {
      this.props.setExtensionInProgress(false);
      this.props.aboutToEndWirePerturb();
      this.props.endWirePerturb();
      if (this.props.wireCreationOn) {
        this.calculateSnapPoint();
      }
    }
    this.draggedPoint = null;
  };

  calculateSnapPoint = () => {
    const graphBounds = this.graph.getBoundingClientRect();
    const p = [this.clientX - graphBounds.left, this.clientY - graphBounds.top];
    const snapPoint = snapPointToPath(p, this.props.wire.points);

    if (this.state.snapPoint !== snapPoint) {
      if (snapPoint) {
        this.lastPosition = snapPoint.p;
      }
      this.setState({ ...this.state, snapPoint });
    }
  };

  isSnapPointShowing = () =>
    this.state.snapPoint !== null &&
    this.props.wireCreationOn &&
    this.state.pathHover;

  insertAdditionalPoint(newPoints, newPoint) {
    const a = newPoints[0];
    const b = newPoints[3];
    const i = a[1] === b[1] ? 0 : 1;
    const increasing = b[i] > a[i];
    const newValue = newPoint[i] + (increasing ? 10 : -10);
    const maxValue = Math.max(a[i], b[i]);
    const minValue = Math.min(a[i], b[i]);
    const additionalPoint = [...newPoint];
    additionalPoint[i] = Math.max(minValue, Math.min(newValue, maxValue));
    newPoints.splice(3, 0, additionalPoint);
    newPoints.splice(3, 0, [...additionalPoint]);
  }

  onPathMouseEnter = event => this.setState({ ...this.state, pathHover: true });

  onPathMouseExit = event => this.setState({ ...this.state, pathHover: false });
}
