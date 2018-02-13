import React, { PureComponent } from "react";
import { drawHead } from "./drawing/drawRectangularPath";
import { insetPoints } from "./drawing/insetPoints";

const length = 8;
const width = 5;

export default class WireHeadComponent extends PureComponent {
  render() {
    const inset = insetPoints(
      this.props.wire.points,
      this.props.wire.intersections
    );
    const head =
      inset.points.length > 1
        ? drawHead(inset.points, true, length, width)
        : "";
    return <path className="wire-head" d={head} />;
  }
}
