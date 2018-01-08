import React, { PureComponent } from 'react';
import WireExtenderComponent from './WireExtenderComponent';
import { drawLine } from './drawing/drawRectangularPath';
import { insetPoints } from './drawing/insetPoints';

export default class WirePathComponent extends PureComponent {

  componentDidMount() {
    this.graph = document.getElementById('graph');
    this.grabber.addEventListener('mousedown', this.onMouseDown);
    this.grabber.addEventListener('click', this.onClick);
    this.grabber.addEventListener('dblclick', this.onDoubleClick);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('blur', this.onBlur);
  }

  componentWillUnmount() {
    this.grabber.removeEventListener('mousedown', this.onMouseDown);
    this.grabber.removeEventListener('click', this.onClick);
    this.grabber.removeEventListener('dblclick', this.onDoubleClick);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('blur', this.onBlur);
  }

  render() {
    const inset = insetPoints(this.props.wire.points, this.props.wire.intersections);
    const line = inset.points.length > 1 ? drawLine(inset.points, inset.intersections) : '';
    return (
      <g className='wire'>
        <path className='wire-path-grabber' d={line} ref={e => this.grabber = e}></path>
        <path className='wire-path' d={line}></path>
        <WireExtenderComponent
          wire={this.props.wire}
          wireCreationOn={this.props.wireCreationOn}
          startWirePerturb={this.props.startWirePerturb}
          perturbWire={this.props.perturbWire}
          aboutToEndWirePerturb={this.props.aboutToEndWirePerturb}
          endWirePerturb={this.props.endWirePerturb}
          setExtensionInProgress={this.props.setExtensionInProgress}
          anyTextEdited={this.props.anyTextEdited} />
      </g>
    );
  }

  onMouseDown = event => {
    event.preventDefault();
    if (event.button === 0) {
      this.pressed = true;
      this.props.onPress(event.ctrlKey || event.metaKey);
      event.stopPropagation();
    }
  }

  onMouseUp = event => this.onRelease(event.ctrlKey || event.metaKey);

  onBlur = () => this.onRelease(false);

  onRelease = shortcutDown => {
    if (this.pressed) {
      this.props.onRelease(shortcutDown);
      this.pressed = false;
    }
  }

  onClick = event => {
    if (event.button === 0 && !this.props.wire.textEditable) {
      this.props.onClick(event.ctrlKey || event.metaKey);
    }
  }

  onDoubleClick = event => {
    if (event.button === 0 && !this.props.wire.textEditable && !event.ctrlKey && !event.metaKey) {
      this.props.startTextEditing();
    }
  }
}