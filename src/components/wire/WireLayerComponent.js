import React, { PureComponent } from "react";
import WirePathContainer from "../../containers/wire/WirePathContainer";
import WireHeadComponent from "./WireHeadComponent";
import WireDragContainer from "../../containers/wire/WireDragContainer";
import WireTextContainer from "../../containers/wire/WireTextContainer";

export default class WireLayerComponent extends PureComponent {
  render() {
    return (
      <div className="wire-layer">
        <svg className="wire-path-layer">
          {this.props.wires.map((w, i) => (
            <WirePathContainer key={i} wire={w} />
          ))}
        </svg>
        <svg className="wire-path-head-layer">
          {this.props.wires.map((w, i) => (
            <WireHeadComponent key={i} wire={w} />
          ))}
        </svg>
        <div className="wire-drag-layer">
          {this.props.wires.map((w, i) => (
            <WireDragContainer key={i} wire={w} />
          ))}
        </div>
        <div className="wire-text-layer">
          {this.props.wires.map((w, i) => (
            <WireTextContainer key={i} wire={w} />
          ))}
        </div>
      </div>
    );
  }
}
