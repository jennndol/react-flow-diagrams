import React, { PureComponent } from "react";
import {
  getRelativePointOnNode,
  getAbsolutePointOnNode
} from "../../reducers/helpers/getPointOnNode";

export default class ConnectorsComponent extends PureComponent {
  grabberElements = {};
  mouseDownListeners = {};
  clickListeners = {};

  componentDidMount() {
    this.root.addEventListener("dblclick", this.onDoubleClick);
    document.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("blur", this.endDrag);
  }

  componentWillUnmount() {
    this.root.removeEventListener("dblclick", this.onDoubleClick);
    document.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("blur", this.endDrag);
  }

  render() {
    return (
      <div ref={e => (this.root = e)}>
        {this.props.node.startConnectors.map(c =>
          this.createConnector(c, true)
        )}
        {this.props.node.endConnectors.map(c => this.createConnector(c, false))}
      </div>
    );
  }

  createConnector(connector, start) {
    const key = connector.id + (start ? "start" : "end");
    const point = getRelativePointOnNode(
      this.props.node,
      connector.pos,
      connector.side
    );
    const style = {
      left: point[0] + "px",
      top: point[1] + "px",
      visibility: connector.selected ? "visible" : "hidden"
    };

    const dragged =
      this.props.dragStatus &&
      this.props.dragStatus.id === connector.id &&
      ((start && this.props.dragStatus.status === "wire-start") ||
        (!start && this.props.dragStatus.status === "wire-end"));

    if (dragged) {
      style.zIndex = 1;
    }

    const className = "connector-grabber grabber" + (dragged ? " dragged" : "");
    return (
      <div
        className={className}
        key={key}
        style={style}
        ref={e => this.addMouseDownListener(e, key, connector, start)}
      >
        <div className="connector" />
      </div>
    );
  }

  addMouseDownListener(element, key, connector, start) {
    this.removeListenerIfPresent(this.mouseDownListeners, key, "mousedown");
    this.removeListenerIfPresent(this.clickListeners, key, "click");

    if (element) {
      const mouseDownListener = event =>
        this.onConnectorMouseDown(event, connector, start);
      const clickListener = event => event.stopPropagation();

      this.addListener(
        this.mouseDownListeners,
        element,
        mouseDownListener,
        key,
        "mousedown"
      );
      this.addListener(
        this.clickListeners,
        element,
        clickListener,
        key,
        "click"
      );
    }
  }

  onConnectorMouseDown = (event, connector, start) => {
    event.preventDefault();
    if (event.button === 0) {
      this.draggedConnector = connector;
      this.startDragged = start;
      this.initialPosition = getAbsolutePointOnNode(
        this.props.node,
        connector.pos,
        connector.side
      );
      this.mouseXAtPress = event.clientX;
      this.mouseYAtPress = event.clientY;
      this.props.onConnectorDragStart(connector.id, start, "pointer");
      event.stopPropagation();
    }
  };

  onMouseMove = event => {
    if (this.draggedConnector) {
      const x = this.initialPosition[0] + event.clientX - this.mouseXAtPress;
      const y = this.initialPosition[1] + event.clientY - this.mouseYAtPress;
      this.props.onConnectorDrag(
        this.draggedConnector.id,
        [x, y],
        this.startDragged
      );
    }
  };

  onMouseUp = event => this.endDrag();

  endDrag = () => {
    if (this.draggedConnector) {
      this.props.onConnectorDragEnd(
        this.draggedConnector.id,
        this.startDragged,
        this.didConnectorMove()
      );
      this.draggedConnector = null;
    }
  };

  addListener(listeners, element, listener, key, type) {
    element.addEventListener(type, listener);
    this.grabberElements[key] = element;
    listeners[key] = listener;
  }

  removeListenerIfPresent(listeners, key, type) {
    const element = this.grabberElements[key];
    const listener = listeners[key];
    if (element && listener) {
      element.removeEventListener(type, listener);
    }
  }

  didConnectorMove() {
    const newConnectors = this.startDragged
      ? this.props.node.startConnectors
      : this.props.node.endConnectors;
    if (newConnectors.some(c => c.id === this.draggedConnector.id)) {
      const newConnector = newConnectors.filter(
        c => c.id === this.draggedConnector.id
      )[0];
      return (
        this.draggedConnector.pos !== newConnector.pos ||
        this.draggedConnector.side !== newConnector.side
      );
    } else {
      return true; // If we disconnected the wire, it moved.
    }
  }

  onDoubleClick = event => event.stopPropagation();
}
