import React, { PureComponent } from "react";
import NodeTextComponent from "./NodeTextComponent";
import NodeResizerComponent from "./NodeResizerComponent";
import ConnectorsComponent from "./ConnectorsComponent";
import WireCreatorComponent from "./WireCreatorComponent";

const dragThreshold = 3;
const hoverOutline = 5; // Adds a transparent outline to capture hover events.

export default class NodeComponent extends PureComponent {
  componentDidMount() {
    this.element.addEventListener("mousedown", this.onMouseDown);
    this.element.addEventListener("click", this.onClick);
    this.element.addEventListener("dblclick", this.onDoubleClick);
    document.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("blur", this.endDrag);
  }

  componentWillUnmount() {
    this.element.removeEventListener("mousedown", this.onMouseDown);
    this.element.removeEventListener("click", this.onClick);
    this.element.removeEventListener("dblclick", this.onDoubleClick);
    document.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("blur", this.endDrag);
  }

  render() {
    const x = this.props.node.x - hoverOutline + "px";
    const y = this.props.node.y - hoverOutline + "px";
    const backgroundStyle = {
      transform: "translate3d(" + x + " ," + y + ", 0px)",
      width: this.props.node.width + 2 * hoverOutline + 1 + "px",
      height: this.props.node.height + 2 * hoverOutline + 1 + "px"
    };
    const className = "node" + (this.props.node.selected ? " selected" : "");
    return (
      <div className="node-background" style={backgroundStyle}>
        <div className={className} ref={e => (this.element = e)}>
          <NodeTextComponent
            textEditable={this.props.node.textEditable}
            editorState={this.props.node.editorState}
            onTextChange={this.props.onTextChange}
            startTextEditing={this.props.startTextEditing}
            onTextEditFinished={this.props.onTextEditFinished}
          />
          <NodeResizerComponent
            node={this.props.node}
            onResizerPress={this.props.onResizerPress}
            onResize={this.props.onResize}
            onResizerRelease={this.props.onResizerRelease}
            wireCreationOn={this.props.wireCreationOn}
          />
          <ConnectorsComponent
            node={this.props.node}
            onConnectorDragStart={this.props.onConnectorDragStart}
            onConnectorDrag={this.props.onConnectorDrag}
            onConnectorDragEnd={this.props.onConnectorDragEnd}
            wireCreationOn={this.props.wireCreationOn}
            dragStatus={this.props.dragStatus}
          />
          <WireCreatorComponent
            node={this.props.node}
            onWireCreationStart={this.props.onWireCreationStart}
            onWireCreated={this.props.onWireCreated}
            onCreatedWireDrag={this.props.onCreatedWireDrag}
            onWireCreationEnd={this.props.onWireCreationEnd}
            wireCreationOn={this.props.wireCreationOn}
            anyTextEdited={this.props.anyTextEdited}
            dragStatus={this.props.dragStatus}
          />
        </div>
      </div>
    );
  }

  onMouseDown = event => {
    event.preventDefault();
    if (event.button === 0) {
      this.dragInProgress = true;
      this.dragOccurred = false;
      this.mouseXAtPress = event.clientX;
      this.mouseYAtPress = event.clientY;
      this.xAtPress = this.props.node.x;
      this.yAtPress = this.props.node.y;
      this.props.onPress(event.ctrlKey || event.metaKey);
      event.stopPropagation();
    }
  };

  onMouseMove = event => {
    if (this.dragInProgress) {
      const deltaX = event.clientX - this.mouseXAtPress;
      const deltaY = event.clientY - this.mouseYAtPress;
      if (!this.thresholdExceeded) {
        this.thresholdExceeded =
          Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold;
      }
      if (this.thresholdExceeded) {
        this.props.onDrag(deltaX, deltaY, !this.dragOccurred);
        this.dragOccurred = true;
      }
    }
  };

  onMouseUp = event => this.endDrag(event.ctrlKey || event.metaKey);

  onBlur = () => this.endDrag(false);

  endDrag = shortcutDown => {
    if (this.dragInProgress) {
      this.props.onRelease(shortcutDown, this.dragOccurred);
      this.dragInProgress = false;
      this.dragOccurred = false;
      this.thresholdExceeded = false;
    }
  };

  onClick = event => {
    if (event.button === 0 && !this.props.node.textEditable) {
      this.props.onClick(event.ctrlKey || event.metaKey);
    }
  };

  onDoubleClick = event => {
    if (
      event.button === 0 &&
      !this.props.node.textEditable &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      this.props.startTextEditing();
    }
  };

  clamp = (value, min, max) => Math.max(min, Math.min(max, value));
}
