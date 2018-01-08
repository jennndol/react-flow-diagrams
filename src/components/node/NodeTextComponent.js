import React, { PureComponent } from 'react';
import TextComponent from '../text/TextComponent';

export default class NodeTextComponent extends PureComponent {

  componentDidMount() {
    this.text.addEventListener('mousedown', this.onMouseDown);
  }

  componentWillUnmount() {
    this.text.removeEventListener('mousedown', this.onMouseDown);
  }

  render() {
    const textClassName = 'node-text' + (this.props.textEditable ? ' editable' : '');
    return (
      <div className='node-text-container'>
        <div className={textClassName} ref={e => this.text = e}>
          <TextComponent
            editorState={this.props.editorState}
            textEditable={this.props.textEditable}
            onTextChange={this.props.onTextChange}
            onTextEditFinished={this.props.onTextEditFinished} />
        </div>
      </div >
    );
  }

  onMouseDown = event => {
    if (this.props.textEditable) {
      event.stopPropagation(); // Prevents node itself from moving if dragging while editing text.
    }
  }
}