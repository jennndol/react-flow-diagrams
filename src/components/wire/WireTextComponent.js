import React, { PureComponent } from "react";
import TextComponent from "../text/TextComponent";
import { layoutWireText } from "./drawing/layoutWireText";

export default class WireTextComponent extends PureComponent {
  componentDidMount() {
    this.root.addEventListener("mousedown", this.onMouseDown);
    this.root.addEventListener("click", this.onClick);
    this.root.addEventListener("dblclick", this.onDoubleClick);
    window.addEventListener("mouseup", this.onMouseUp);
  }

  componentWillUnmount() {
    this.root.removeEventListener("mousedown", this.onMouseDown);
    this.root.removeEventListener("click", this.onClick);
    this.root.removeEventListener("dblclick", this.onDoubleClick);
    window.removeEventListener("mouseup", this.onMouseUp);
  }

  render() {
    const position = layoutWireText(this.props.wire.points);
    const selected = this.props.wire.selected || this.props.extensionInProgress;
    const className =
      "wire-text grabber" +
      (selected ? " selected" : "") +
      (this.props.wire.textEditable ? " editable" : "");
    const hasText =
      this.props.wire.editorState &&
      this.props.wire.editorState.getCurrentContent().hasText();
    const style = {
      left: position[0] + "px",
      top: position[1] + "px",
      zIndex: this.props.index,
      visibility: hasText || this.props.wire.textEditable ? "visible" : "hidden"
    };

    return (
      <div className="wire-text-container" style={style}>
        <div className={className} ref={e => (this.root = e)}>
          <TextComponent
            editorState={this.props.wire.editorState}
            textEditable={this.props.wire.textEditable}
            onTextChange={this.props.onTextChange}
            onTextEditFinished={this.props.onTextEditFinished}
          />
        </div>
      </div>
    );
  }

  onMouseDown = event => {
    if (event.button === 0) {
      if (!this.props.wire.textEditable) {
        event.preventDefault();
      }
      event.stopPropagation();
      this.pressed = true;
      this.props.onPress(event.ctrlKey || event.metaKey);
    }
  };

  onMouseUp = event => {
    if (this.pressed) {
      this.props.onRelease(event.ctrlKey || event.metaKey);
      this.pressed = false;
    }
  };

  onClick = event => {
    if (event.button === 0 && !this.props.wire.textEditable) {
      this.props.onClick(event.ctrlKey || event.metaKey);
    }
  };

  onDoubleClick = event => {
    if (
      event.button === 0 &&
      !this.props.wire.textEditable &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      this.props.startTextEditing();
    }
  };
}
