import React, { PureComponent } from 'react';
import NodeContainer from '../../containers/node/NodeContainer';

export default class NodeLayerComponent extends PureComponent {

  render() {
    return (
      <div className='node-layer'>
        {this.props.nodes.map(n => <NodeContainer key={n.id} node={n} />)}
      </div>
    );
  }
}