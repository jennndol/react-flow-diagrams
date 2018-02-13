import React, { PureComponent } from "react";

const padding = 10;
const minHeight = 40;
const minWidth = 60;

export default class NodeResizerComponent extends PureComponent {
  state = { resizeInProgress: null };

  componentDidMount() {
    this.graph = document.getElementById("graph");

    this.root.addEventListener("click", this.stopPropagation);
    this.root.addEventListener("dblclick", this.stopPropagation);
    this.northWest.addEventListener("mousedown", this.onNorthWestDown);
    this.north.addEventListener("mousedown", this.onNorthDown);
    this.northEast.addEventListener("mousedown", this.onNorthEastDown);
    this.east.addEventListener("mousedown", this.onEastDown);
    this.southEast.addEventListener("mousedown", this.onSouthEastDown);
    this.south.addEventListener("mousedown", this.onSouthDown);
    this.southWest.addEventListener("mousedown", this.onSouthWestDown);
    this.west.addEventListener("mousedown", this.onWestDown);

    document.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("blur", this.endDrag);
  }

  componentWillUnmount() {
    this.root.removeEventListener("click", this.stopPropagation);
    this.root.removeEventListener("dblclick", this.stopPropagation);
    this.northWest.removeEventListener("mousedown", this.onNorthWestDown);
    this.north.removeEventListener("mousedown", this.onNorthDown);
    this.northEast.removeEventListener("mousedown", this.onNorthEastDown);
    this.east.removeEventListener("mousedown", this.onEastDown);
    this.southEast.removeEventListener("mousedown", this.onSouthEastDown);
    this.south.removeEventListener("mousedown", this.onSouthDown);
    this.southWest.removeEventListener("mousedown", this.onSouthWestDown);
    this.west.removeEventListener("mousedown", this.onWestDown);

    document.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("blur", this.endDrag);
  }

  render() {
    return (
      <div className="resizer-group" ref={e => (this.root = e)}>
        <div
          className={this.getClasses("north-west")}
          ref={e => (this.northWest = e)}
        >
          <div className="resizer" />
        </div>
        <div className={this.getClasses("north")} ref={e => (this.north = e)}>
          <div className="resizer" />
        </div>
        <div
          className={this.getClasses("north-east")}
          ref={e => (this.northEast = e)}
        >
          <div className="resizer" />
        </div>
        <div className={this.getClasses("east")} ref={e => (this.east = e)}>
          <div className="resizer" />
        </div>
        <div
          className={this.getClasses("south-east")}
          ref={e => (this.southEast = e)}
        >
          <div className="resizer" />
        </div>
        <div className={this.getClasses("south")} ref={e => (this.south = e)}>
          <div className="resizer" />
        </div>
        <div
          className={this.getClasses("south-west")}
          ref={e => (this.southWest = e)}
        >
          <div className="resizer" />
        </div>
        <div className={this.getClasses("west")} ref={e => (this.west = e)}>
          <div className="resizer" />
        </div>
      </div>
    );
  }

  getClasses = direction =>
    "resizer-grabber " +
    direction +
    (this.props.node.selected ? " grabber" : "") +
    (this.state.resizeInProgress === direction ? " dragged" : "");

  onNorthWestDown = event =>
    this.onMouseDown(event, "north-west", "nwse-resize");

  onNorthDown = event => this.onMouseDown(event, "north", "ns-resize");

  onNorthEastDown = event =>
    this.onMouseDown(event, "north-east", "nesw-resize");

  onEastDown = event => this.onMouseDown(event, "east", "ew-resize");

  onSouthEastDown = event =>
    this.onMouseDown(event, "south-east", "nwse-resize");

  onSouthDown = event => this.onMouseDown(event, "south", "ns-resize");

  onSouthWestDown = event =>
    this.onMouseDown(event, "south-west", "nesw-resize");

  onWestDown = event => this.onMouseDown(event, "west", "ew-resize");

  onMouseDown = (event, resizeDirection, cursor) => {
    event.preventDefault();
    if (event.button === 0) {
      event.stopPropagation();
      this.resizeDirections = resizeDirection.split("-");
      this.mouseXAtPress = event.clientX;
      this.mouseYAtPress = event.clientY;
      this.xAtPress = this.props.node.x;
      this.yAtPress = this.props.node.y;
      this.widthAtPress = this.props.node.width;
      this.heightAtPress = this.props.node.height;
      this.props.onResizerPress(resizeDirection, cursor);
      this.setState({ ...this.state, resizeInProgress: resizeDirection });
    }
  };

  onMouseMove = event => {
    if (this.resizeDirections) {
      let position = {
        x: this.xAtPress,
        y: this.yAtPress,
        w: this.widthAtPress,
        h: this.heightAtPress
      };
      this.resizeDirections.forEach(direction =>
        this.doResize(direction, event.clientX, event.clientY, position)
      );
      this.props.onResize(
        position.x,
        position.y,
        position.w,
        position.h,
        this.resizeDirections
      );
      this.resizeOccurred = true;
    }
  };

  onMouseUp = event => this.endResize();

  doResize = (direction, mouseX, mouseY, position) => {
    const deltaX = mouseX - this.mouseXAtPress;
    const deltaY = mouseY - this.mouseYAtPress;
    const maxX = this.graph.clientWidth - padding;
    const maxY = this.graph.clientHeight - padding;
    if (direction === "east") {
      position.w = this.clamp(
        this.widthAtPress + deltaX,
        minWidth,
        maxX - this.xAtPress
      );
    } else if (direction === "south") {
      position.h = this.clamp(
        this.heightAtPress + deltaY,
        minHeight,
        maxY - this.yAtPress
      );
    } else if (direction === "west") {
      position.x = this.clamp(
        this.xAtPress + deltaX,
        padding,
        this.xAtPress + this.widthAtPress - minWidth
      );
      position.w = this.xAtPress + this.widthAtPress - position.x;
    } else if (direction === "north") {
      position.y = this.clamp(
        this.yAtPress + deltaY,
        padding,
        this.yAtPress + this.heightAtPress - minHeight
      );
      position.h = this.yAtPress + this.heightAtPress - position.y;
    }
  };

  endResize = () => {
    if (this.resizeDirections) {
      this.props.onResizerRelease(this.resizeOccurred);
      this.setState({ ...this.state, resizeInProgress: null });
    }
    this.resizeDirections = null;
    this.resizeOccurred = false;
  };

  clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  stopPropagation = event => event.stopPropagation();
}
