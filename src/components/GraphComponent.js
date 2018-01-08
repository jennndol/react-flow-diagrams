import React, { PureComponent } from 'react';
import NodeLayerContainer from '../containers/node/NodeLayerContainer';
import WireLayerContainer from '../containers/wire/WireLayerContainer';
import SelectionContainer from '../containers/SelectionContainer';
import SnapGuideContainer from '../containers/SnapGuideContainer';
import LinksComponent from './LinksComponent';
import '../css/graph.css';

export default class GraphComponent extends PureComponent {

  componentDidMount() {
    this.graph.addEventListener('mousedown', this.onMouseDown);
    this.graph.addEventListener('mousedown', this.onFilterMouseDown, true);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    window.addEventListener('mouseup', this.onFilterMouseUp, true);
    window.addEventListener('load', this.onLoad);
  }

  componentWillUnmount() {
    this.graph.removeEventListener('mousedown', this.onMouseDown);
    this.graph.removeEventListener('mousedown', this.onFilterMouseDown, true);
    document.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('mouseup', this.onFilterMouseUp, true);
    window.removeEventListener('load', this.onLoad);
  }

  render() {
    const cursor = this.props.dragStatus ? this.props.dragStatus.cursor : 'inherit';
    const className = 'graph'
      + (this.props.dragStatus ? ' any-drag' : '')
      + (this.props.wireCreationOn ? ' wire-creation-on' : '');

    return (
      <div id='graph' className={className} ref={e => this.graph = e} tabIndex={-1} style={{ cursor }}>
        <LinksComponent />
        <SnapGuideContainer />
        <WireLayerContainer />
        <NodeLayerContainer />
        <SelectionContainer />
      </div>
    );
  }

  onKeyDown = event => {
    if (!this.pressed || event.keyCode === 18) {
      this.props.onKeyDown(event, this.props);
    }
  }

  onKeyUp = event => this.props.onKeyUp(event, this.props);

  onMouseDown = event => {
    event.preventDefault();
    this.props.onMouseDown(event, this.props);
  }

  onBlur = () => this.props.onBlur();

  onFilterMouseDown = event => this.pressed = true;

  onFilterMouseUp = event => this.pressed = false;

  onLoad = () => this.props.onLoad();
}