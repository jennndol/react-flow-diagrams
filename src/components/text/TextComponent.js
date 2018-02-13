import React, { PureComponent } from "react";
import { Editor, EditorState, RichUtils } from "draft-js";

export default class TextComponent extends PureComponent {
  componentWillReceiveProps(nextProps) {
    if (this.props.textEditable && !nextProps.textEditable) {
      this.props.onTextEditFinished();
    }
  }

  render() {
    return (
      <Editor
        editorState={
          this.props.editorState
            ? this.props.editorState
            : EditorState.createEmpty()
        }
        readOnly={!this.props.textEditable}
        onChange={this.props.onTextChange}
        handleKeyCommand={this.handleKeyCommand}
      />
    );
  }

  handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.props.onTextChange(newState);
      return "handled";
    } else {
      return "not-handled";
    }
  };
}
