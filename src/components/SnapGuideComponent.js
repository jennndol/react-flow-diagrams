import React, { PureComponent } from 'react';

export default class SnapGuideComponent extends PureComponent {

  render() {
    this.index = 0;
    return (
      <svg className='snap-guides'>
        {this.props.guides.map(g => this.renderSnapGuide(g))}
        {this.props.guides.length > 0 && this.props.wires.map(w => this.createPath(w))}
      </svg>
    );
  }

  renderSnapGuide(g) {
    const path = `M ${g.x1} ${g.y1} L ${g.x2} ${g.y2}`;
    return <path key={++this.index} className='snap-guide' d={path}></path>
  }

  createPath(w) {
    let path = `M ${w.points[0][0]} ${w.points[0][1]}`;
    for (let i = 0; i < w.points.length - 1; i++) {
      const a = w.points[i];
      const b = w.points[i + 1];
      const h = a[1] === b[1];
      path += h ? ` H ${b[0]}` : ` V ${b[1]}`;
    }
    return <path key={++this.index} className='snap-guide-wire-mask' d={path}></path>
  }
}