import React, { PureComponent } from 'react';
import '../css/links.css';

export default class LinksComponent extends PureComponent {

  componentDidMount() {
    this.root.addEventListener('mousedown', this.stopPropagation);
  }

  componentWillUnmount() {
    this.root.removeEventListener('mousedown', this.stopPropagation);
  }

  render() {
    return (
      <div className='link-bar' ref={e => this.root = e}>
        <a href='https://github.com/rmfisher/react-flow-diagrams/#instructions'>Help</a>
        <a href='https://github.com/rmfisher/react-flow-diagrams'>GitHub</a>
      </div>
    );
  }

  stopPropagation = e => e.stopPropagation();
}