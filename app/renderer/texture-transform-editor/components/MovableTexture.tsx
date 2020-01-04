// @ts-nocheck
import React from 'react';
import Moveable from 'react-moveable';
import Net from '../3-uniform_54.svg';

export const MoveableTexture = () => {
  const textureRef = React.useRef();
  const [transform, setTransform] = React.useState({
    scaleX: 1, scaleY: 1, translateX: 100, translateY: 100, rotate: 0,
  });

  const transformStr = `translate(${
    transform.translateX}, ${transform.translateY}) rotate(${transform.rotate}) scale(${
    transform.scaleX}, ${transform.scaleY}) `;

  return (
    <>
      <div>
        {JSON.stringify(transform, null, 2)}
      </div>
      <MoveableControls {...{ setTransform, transform, textureRef }} />
      <Net ref={textureRef} transform={transformStr} />
    </>

  );
};

export const MoveableControls = ({ textureRef, setTransform, transform }) => {
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
        onScale={({ delta }) => {
          // @ts-ignore
          setTransform({ ...transform, scaleX: transform.scaleX * delta[0], scaleY: transform.scaleY * delta[1] });
        }}
        onRotate={({ beforeDelta }) => {
          setTransform({ ...transform, rotate: transform.rotate + beforeDelta });
        }}
        onDrag={({ beforeDelta }) => {
          setTransform({
            ...transform,
            translateX: transform.translateX + beforeDelta[0],
            translateY: transform.translateY + beforeDelta[1],
          });
        }}
      />
    </>
  );
};
