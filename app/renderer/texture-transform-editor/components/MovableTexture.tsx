// @ts-nocheck
import React, { Component } from 'react';
import Moveable from 'react-moveable';

export class MoveableTexture extends Component {
  constructor() {
    super();
    this.state = {
      transform: {
        scaleX: 1, scaleY: 1, translateX: 100, translateY: 100, rotate: 0,
      },
    };
    this.textureRef = React.createRef();
    this.moveableRef = React.createRef();
    this.setTransform = this.setTransform.bind(this);
  }

  async componentDidMount(): void {
    const fileList = await ipcRenderer.invoke('list-texture-files');
    this.setState({ fileList, selectedFileIndex: 0 });
  }

  setTransform(transform) {
    this.setState((state) => ({ transform: { ...state.transform, ...transform } }));
  }

  render() {
    const { state: { transform, fileList, selectedFileIndex } } = this;
    if (!fileList) { return null; }
    const fileLink = fileList[selectedFileIndex];
    const transformStr = `translate(${
      transform.translateX}, ${transform.translateY}) rotate(${transform.rotate}) scale(${
      transform.scaleX}, ${transform.scaleY}) `;
    return (
      <>
        <div>
          {JSON.stringify(transform, null, 2)}
        </div>
        <MoveableControls
          ref={this.moveableRef}
          {...{ setTransform: this.setTransform, transform, textureRef: this.textureRef }}
        />
        <svg width="100%" height="100%" style={{ height: '-webkit-fill-available', width: '-webkit-fill-available' }}>
          <image
            onLoad={() => {
              this.moveableRef.current.updateRect();
            }}
            ref={this.textureRef}
            transform={transformStr}
            style={{ transformOrigin: 'center center' }}
            xlinkHref={`./images/${fileLink}`}
          />
        </svg>
      </>
    );
  }
}

const MoveableControls = React.forwardRef(({ textureRef, setTransform, transform }, ref) => {
  const [renderMovable, settRenderMovable] = React.useState(false);

  React.useEffect(() => {
    settRenderMovable(true);
  }, []);

  if (!renderMovable) return null;

  return (
    <>
      <Moveable
        ref={ref}
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
});
