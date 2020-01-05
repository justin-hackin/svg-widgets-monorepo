// @ts-nocheck
import React, { Component } from 'react';
import Moveable from 'react-moveable';

export class MoveableTexture extends Component {
  constructor() {
    super();
    this.state = {
      scaleX: 1, scaleY: 1, translateX: 100, translateY: 100, rotate: 0,
    };
  }

  async componentDidMount(): void {
    const Net = await import('../../../common/images/3-uniform_54.svg');
    this.textureRef = React.createRef();
    this.setState({ Net: Net.default });
  }

  render() {
    const { state: { Net, ...state }, setState } = this;
    if (!Net || !this.textureRef) { return null; }
    const transformStr = `translate(${
      state.translateX}, ${state.translateY}) rotate(${state.rotate}) scale(${
      state.scaleX}, ${state.scaleY}) `;
    return (
      <>
        <div>
          {JSON.stringify(state, null, 2)}
        </div>
        <MoveableControls {...{ setTransform: setState.bind(this), transform: state, textureRef: this.textureRef }} />
        <Net ref={this.textureRef} transform={transformStr} />
      </>
    );
  }
}

const MoveableControls = ({ textureRef, setTransform, transform }) => {
  const [renderMovable, settRenderMovable] = React.useState(false);

  React.useEffect(() => {
    settRenderMovable(true);
  }, []);

  if (!renderMovable) return null;

  return (
    <>
      <Moveable
        target={textureRef.current}
        scalable
        rotatable
        draggable
        onRotate={({ beforeDelta }) => {
          setTransform({ rotate: transform.rotate + beforeDelta });
        }}
        onScale={({ delta }) => {
          setTransform({ scaleX: transform.scaleX * delta[0], scaleY: transform.scaleY * delta[1] });
        }}
        onDrag={({ beforeDelta }) => {
          setTransform({
            translateX: transform.translateX + beforeDelta[0],
            translateY: transform.translateY + beforeDelta[1],
          });
        }}
      />
    </>
  );
};
