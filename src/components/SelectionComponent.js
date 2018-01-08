import React, { PureComponent } from 'react';

export default class SelectionComponent extends PureComponent {

  componentDidMount() {
    this.graph = document.getElementById('graph');
    this.graph.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('blur', this.endDrag);

    this.setBoxPosition(0, 0, 0, 0);
    this.box.style.visibility = 'hidden';
  }

  componentWillUnmount() {
    this.graph.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('blur', this.endDrag);
  }

  render() {
    return <div className='selection-box' ref={e => this.box = e} />;
  }

  onMouseDown = event => {
    if (event.button === 0) {
      event.preventDefault();
      const graphBounds = this.graph.getBoundingClientRect();
      this.dragInProgress = true;
      this.mouseXAtPress = event.clientX - graphBounds.left;
      this.mouseYAtPress = event.clientY - graphBounds.top;
    }
  }

  onMouseMove = event => {
    if (this.dragInProgress) {
      const graphBounds = this.graph.getBoundingClientRect();
      const minX = Math.min(this.mouseXAtPress, event.clientX - graphBounds.left);
      const minY = Math.min(this.mouseYAtPress, event.clientY - graphBounds.top);
      const maxX = Math.max(this.mouseXAtPress, event.clientX - graphBounds.left);
      const maxY = Math.max(this.mouseYAtPress, event.clientY - graphBounds.top);
      this.setBoxPosition(minX, minY, maxX - minX, maxY - minY);
      this.box.style.visibility = 'visible';
    }
  }

  onMouseUp = event => this.endDrag();

  endDrag = () => {
    if (this.dragInProgress) {
      this.dragInProgress = false;
      this.box.style.visibility = 'hidden';
      this.props.selectInArea(this.getBoxPosition());
      this.setBoxPosition(0, 0, 0, 0);
    }
  }

  setBoxPosition = (x, y, w, h) => {
    this.box.style.left = x + 'px';
    this.box.style.top = y + 'px';
    this.box.style.width = w + 'px';
    this.box.style.height = h + 'px';
  }

  getBoxPosition = () => {
    return {
      x: parseInt(this.box.style.left, 10),
      y: parseInt(this.box.style.top, 10),
      width: parseInt(this.box.style.width, 10),
      height: parseInt(this.box.style.height, 10),
    };
  }
}