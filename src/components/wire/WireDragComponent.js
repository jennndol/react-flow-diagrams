import React, { PureComponent } from "react";
import { movePointRectangular } from "./path/movePoints";

export default class WireDragComponent extends PureComponent {
  grabberElements = {};
  mouseDownListeners = {};

  componentDidMount() {
    this.startResizer.addEventListener("mousedown", this.onStartMouseDown);
    this.endResizer.addEventListener("mousedown", this.onEndMouseDown);
    this.root.addEventListener("dblclick", this.onDoubleClick);
    document.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("blur", this.endDrag);
  }

  componentWillUnmount() {
    this.startResizer.removeEventListener("mousedown", this.onStartMouseDown);
    this.endResizer.removeEventListener("mousedown", this.onEndMouseDown);
    this.root.removeEventListener("dblclick", this.onDoubleClick);
    document.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("blur", this.endDrag);
  }

  render() {
    const idMatch =
      this.props.dragStatus && this.props.dragStatus.id === this.props.wire.id;
    const startDragged =
      idMatch && this.props.dragStatus.status === "wire-start";
    const endDragged = idMatch && this.props.dragStatus.status === "wire-end";
    const startGrabberClass =
      "wire-outer-grabber grabber" + (startDragged ? " dragged" : "");
    const endGrabberClass =
      "wire-outer-grabber grabber" + (endDragged ? " dragged" : "");
    const start = this.props.wire.points[0];
    const end = this.props.wire.points[this.props.wire.points.length - 1];

    const startStyle = {
      visibility:
        this.props.wire.selected && this.props.wire.startNodeId === null
          ? "visible"
          : "hidden",
      left: start[0] + "px",
      top: start[1] + "px"
    };
    const endStyle = {
      visibility:
        this.props.wire.selected && this.props.wire.endNodeId === null
          ? "visible"
          : "hidden",
      left: end[0] + "px",
      top: end[1] + "px"
    };

    return (
      <div className="wire-resizer-group" ref={e => (this.root = e)}>
        {this.getInnerResizers().map(r => this.createInnerResizer(r))}
        <div
          className={startGrabberClass}
          ref={e => (this.startResizer = e)}
          style={startStyle}
        >
          <div className="wire-outer-resizer" />
        </div>
        <div
          className={endGrabberClass}
          ref={e => (this.endResizer = e)}
          style={endStyle}
        >
          <div className="wire-outer-resizer" />
        </div>
      </div>
    );
  }

  getInnerResizers() {
    const innerResizers = [];
    if (this.props.wire.points.length > 3) {
      for (let i = 1; i < this.props.wire.points.length - 1; i++) {
        const a = this.props.wire.points[i - 1];
        const b = this.props.wire.points[i];
        const c = this.props.wire.points[i + 1];
        const x = b[0];
        const y = b[1];
        const cursor = this.getCursor(i, a, b, c);
        const h = b[1] === c[1];
        innerResizers.push({ x, y, i, cursor, h });
      }
    }
    return innerResizers;
  }

  addResizeListener(element, r) {
    this.removeResizeListener(r.i);
    if (element) {
      const listener = event => this.onInnerResizerMouseDown(event, r);
      element.addEventListener("mousedown", listener);
      this.grabberElements[r.i] = element;
      this.mouseDownListeners[r.i] = listener;
    }
  }

  removeResizeListener(index) {
    const element = this.grabberElements[index];
    const listener = this.mouseDownListeners[index];
    if (element && listener) {
      element.removeEventListener("mousedown", listener);
    }
  }

  createInnerResizer(r) {
    const dragged =
      this.props.dragStatus &&
      this.props.dragStatus.id === this.props.wire.id &&
      this.props.dragStatus.status === "wire-perturb" &&
      this.props.dragStatus.index === r.i;

    const style = {
      visibility: this.props.wire.selected ? "visible" : "hidden",
      cursor: dragged ? this.props.dragStatus.cursor : r.cursor,
      left: r.x + "px",
      top: r.y + "px"
    };

    if (dragged) {
      style.zIndex = "1";
    }

    // Set a different key to force a re-mount when wire-extension ends. Fixes a bug where the a different
    // resizer would show the hover effect briefly at the end of a wire-extension.
    const key =
      r.i +
      (dragged && this.props.wire.extensionInProgress
        ? "-dragged-extended"
        : "");
    const className =
      "wire-inner-grabber grabber" + (dragged ? " dragged" : "");
    return (
      <div
        key={key}
        className={className}
        style={style}
        ref={e => this.addResizeListener(e, r)}
      >
        <div className="wire-inner-resizer" />
      </div>
    );
  }

  onStartMouseDown = event => {
    event.preventDefault();
    if (event.button === 0 && !this.props.dragStatus) {
      this.startDragInProgress = true;
      this.mouseXAtPress = event.clientX;
      this.mouseYAtPress = event.clientY;
      this.startAtPress = this.props.wire.points[0];
      this.pointsAtPress = this.props.wire.points;
      this.props.startWireDrag("wire-start", -1, "pointer");
      event.stopPropagation();
    }
  };

  onEndMouseDown = event => {
    event.preventDefault();
    if (event.button === 0 && !this.props.dragStatus) {
      this.endDragInProgress = true;
      this.mouseXAtPress = event.clientX;
      this.mouseYAtPress = event.clientY;
      this.endAtPress = this.props.wire.points[
        this.props.wire.points.length - 1
      ];
      this.pointsAtPress = this.props.wire.points;
      this.props.startWireDrag("wire-end", -1, "pointer");
      event.stopPropagation();
    }
  };

  onInnerResizerMouseDown = (event, r) => {
    event.preventDefault();
    if (event.button === 0 && !this.props.dragStatus) {
      this.draggedPoint = r;
      this.mouseXAtPress = event.clientX;
      this.mouseYAtPress = event.clientY;
      this.pointsAtPress = this.props.wire.points;
      this.props.startWireDrag("wire-perturb", r.i, r.cursor);
      event.stopPropagation();
    }
  };

  onMouseMove = event => {
    if (this.endDragInProgress) {
      const endX = this.endAtPress[0] + event.clientX - this.mouseXAtPress;
      const endY = this.endAtPress[1] + event.clientY - this.mouseYAtPress;
      this.props.dragWire([endX, endY], false, true);
    } else if (this.startDragInProgress) {
      const startX = this.startAtPress[0] + event.clientX - this.mouseXAtPress;
      const startY = this.startAtPress[1] + event.clientY - this.mouseYAtPress;
      this.props.dragWire([startX, startY], true, true);
    } else if (this.draggedPoint) {
      const i = this.draggedPoint.i;
      const h = this.draggedPoint.h;
      const hDragAllowed = this.draggedPoint.cursor !== "ns-resize";
      const vDragAllowed = this.draggedPoint.cursor !== "ew-resize";
      const deltaX = hDragAllowed ? event.clientX - this.mouseXAtPress : 0;
      const deltaY = vDragAllowed ? event.clientY - this.mouseYAtPress : 0;
      const newX = this.pointsAtPress[i][0] + deltaX;
      const newY = this.pointsAtPress[i][1] + deltaY;
      const newPoints = movePointRectangular(
        this.props.wire.points,
        i,
        h,
        newX,
        newY
      );
      const axis =
        hDragAllowed && vDragAllowed ? "both" : hDragAllowed ? "h" : "v";
      const snapInput = {
        i: this.draggedPoint.i,
        h: this.draggedPoint.h,
        axis
      };
      this.props.perturbWire(newPoints, snapInput);
    }
  };

  onMouseUp = event => this.endDrag();

  endDrag = () => {
    if (this.startDragInProgress) {
      this.props.endWireDrag(true);
    } else if (this.endDragInProgress) {
      this.props.endWireDrag(false);
    } else if (this.draggedPoint) {
      this.props.endWirePerturb();
    }
    this.startDragInProgress = false;
    this.endDragInProgress = false;
    this.draggedPoint = null;
  };

  getCursor(index, a, b, c) {
    const h = b[1] === c[1];
    if (index === 1) {
      return h ? "ns-resize" : "ew-resize";
    } else if (index === this.props.wire.points.length - 2) {
      return h ? "ew-resize" : "ns-resize";
    } else {
      const firstIncreasing = h ? b[1] > a[1] : b[0] > a[0];
      const secondIncreasing = h ? c[0] > b[0] : c[1] > b[1];
      return firstIncreasing === secondIncreasing
        ? "nesw-resize"
        : "nwse-resize";
    }
  }

  onDoubleClick = event => {
    if (event.button === 0) {
      this.props.resetWire();
    }
  };
}
