import React, { Component } from "react";
import { snapToBox } from "../../reducers/wire/snapPointToBox";

const thresholdToAllowSelfConnect = 20;
const thresholdToShowAgainAfterDrag = 10;

export default class WireCreatorComponent extends Component {
  state = {
    side: null,
    snappedToTarget: false,
    localX: 0,
    localY: 0,
    nodeHover: false,
    suppressed: false
  };
  lastVisibleX = 0;
  lastVisibleY = 0;
  createdWireId = null;
  xAtPress = 0;
  yAtPress = 0;
  suppressedByEnterWireCreationMode = false;

  componentDidMount() {
    this.graph = document.getElementById("graph");
    this.grandparent = this.element.parentElement.parentElement;
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mousedown", this.onMouseDown, true);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("blur", this.endDrag);
    this.grandparent.addEventListener("mouseenter", this.onNodeMouseEnter);
    this.grandparent.addEventListener("mouseleave", this.onNodeMouseExit);
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mousedown", this.onMouseDown, true);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("blur", this.endDrag);
    this.grandparent.removeEventListener("mouseenter", this.onNodeMouseEnter);
    this.grandparent.removeEventListener("mouseleave", this.onNodeMouseExit);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.props.wireCreationOn && nextProps.wireCreationOn) {
      // Don't show the wire-creator if the user simply presses shift without moving the mouse,
      // because then the creator may appear unexpectedly when using shift for other things, e.g.
      // shift + arrow keys to add nodes, or when typing to add text to a node.
      this.suppressedByEnterWireCreationMode = true;
      return false;
    }

    const nextVisible = this.isVisible(nextState, nextProps);
    const visibilityChanged =
      this.isVisible(this.state, this.props) !== nextVisible;
    return nextVisible || visibilityChanged;
  }

  componentWillReceiveProps(nextProps) {
    if (
      !this.props.wireCreationOn &&
      nextProps.wireCreationOn &&
      this.clientX &&
      this.clientY
    ) {
      this.checkForSnap();
    }
  }

  render() {
    const visible = this.isVisible(this.state, this.props);
    const style = {
      opacity: visible ? 1 : 0,
      transform: visible ? "scale(1.0)" : "scale(0.0)",
      left: (visible ? this.state.localX : this.lastVisibleX) - 5 + "px",
      top: (visible ? this.state.localY : this.lastVisibleY) - 16 + "px",
      visibility:
        this.createInProgress || this.props.anyTextEdited ? "hidden" : "visible"
    };
    if (visible) {
      this.lastVisibleX = this.state.localX;
      this.lastVisibleY = this.state.localY;
    }

    return (
      <div className="wire-creator" style={style} ref={e => (this.element = e)}>
        <svg className="wire-creator-plus-svg">
          <path
            className="wire-creator-plus"
            d="M 4 0 h 3 v 4 h 4 v 3 h -4 v 4 h -3 v -4 h -4 v -3 h 4 Z"
          />
        </svg>
        <div className="wire-creator-connector" />
      </div>
    );
  }

  onMouseDown = event => {
    if (event.button === 0) {
      if (this.isVisible(this.state, this.props)) {
        event.preventDefault();
        event.stopPropagation();
        this.createInProgress = true;
      }
      this.mouseDown = true;
      this.xAtPress = event.clientX;
      this.yAtPress = event.clientY;
    }
  };

  onMouseMove = event => {
    this.clientX = event.clientX;
    this.clientY = event.clientY;
    if (this.createInProgress) {
      if (!this.wireWasCreated) {
        this.wireWasCreated = true;
        this.props.onWireCreationStart(
          this.getStartPos(),
          this.getMousePositionInGraph(event),
          this.state.side
        );
        this.createdWireId = Math.max(
          ...this.props.node.startConnectors.map(c => c.id)
        );
        this.props.onWireCreated(this.createdWireId);
      } else if (this.createdWireId !== null) {
        if (!this.thresholdExceeded) {
          const dragDelta = Math.hypot(
            event.clientX - this.xAtPress,
            event.clientY - this.yAtPress
          );
          this.thresholdExceeded = dragDelta > thresholdToAllowSelfConnect;
        }
        this.props.onCreatedWireDrag(
          this.createdWireId,
          this.getMousePositionInGraph(event),
          this.thresholdExceeded
        );
      }
    } else if (this.props.wireCreationOn && !this.props.dragStatus) {
      this.checkForSnap();
    }
    if (this.mouseDown && !this.state.suppressed) {
      this.setState({ ...this.state, suppressed: true });
    } else if (!this.mouseDown && this.state.suppressed) {
      const deltaSinceRelease = Math.hypot(
        event.clientX - this.xAtRelease,
        event.clientY - this.yAtRelease
      );
      if (deltaSinceRelease > thresholdToShowAgainAfterDrag) {
        this.setState({ ...this.state, suppressed: false });
      }
    }
  };

  onMouseUp = event => this.endDrag();

  endDrag = () => {
    if (this.createInProgress && this.createdWireId) {
      this.props.onWireCreationEnd(this.createdWireId);
    }
    this.thresholdExceeded = false;
    this.createInProgress = false;
    this.createdWireId = null;
    this.wireWasCreated = false;
    this.mouseDown = false;
    this.xAtRelease = this.clientX;
    this.yAtRelease = this.clientY;
  };

  isVisible = (state, props) =>
    state.side !== null &&
    props.wireCreationOn &&
    state.nodeHover &&
    !props.dragStatus &&
    !state.suppressed;

  checkForSnap = () => {
    const mousePositionInGraph = this.getMousePositionInGraph();
    const snapResult = snapToBox(
      mousePositionInGraph[0],
      mousePositionInGraph[1],
      this.props.node
    );
    const side = snapResult.snappedSide;
    const snappedToTarget = snapResult.snappedToTarget;
    const localX = snapResult.x - this.props.node.x;
    const localY = snapResult.y - this.props.node.y;

    const needsUpdate =
      this.state.side !== side ||
      this.state.snappedToTarget !== snappedToTarget ||
      this.state.localX !== localX ||
      this.state.localY !== localY;

    if (needsUpdate || this.suppressedByEnterWireCreationMode) {
      this.suppressedByEnterWireCreationMode = false;
      this.setState({ ...this.state, side, snappedToTarget, localX, localY });
    }
  };

  getMousePositionInGraph = () => {
    const graphBounds = this.graph.getBoundingClientRect();
    return [this.clientX - graphBounds.left, this.clientY - graphBounds.top];
  };

  getStartPos = () => {
    let ratio;
    if (this.state.side === "left" || this.state.side === "right") {
      ratio = this.state.localY / this.props.node.height;
    } else if (this.state.side === "top" || this.state.side === "bottom") {
      ratio = this.state.localX / this.props.node.width;
    }
    return ratio > 0.49 && ratio < 0.51 ? 0.5 : ratio;
  };

  onNodeMouseEnter = event => this.setState({ ...this.state, nodeHover: true });

  onNodeMouseExit = event => this.setState({ ...this.state, nodeHover: false });
}
