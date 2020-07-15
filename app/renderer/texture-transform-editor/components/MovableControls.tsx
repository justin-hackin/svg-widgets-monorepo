import * as React from 'react';
import { createPortal } from 'react-dom';
import ReactMoveable from 'react-moveable';

const { useState, useRef, useEffect } = React;

const PortalizedReactMoveable = React.forwardRef(
  // @ts-ignore
  ({ portalEl, ...restProps }, ref) => {
    if (!portalEl) { return null; }
    // @ts-ignore
    return createPortal(<ReactMoveable {...restProps} ref={ref} />, portalEl);
  },
);

export const MoveableSvgGroup = ({
// @ts-ignore
  children, outerTransform, controllerProps = {}, portalRef,
}) => {
  const [transform, setWholeTransform] = useState({
    scaleX: 1, scaleY: 1, translateX: 0, translateY: 0, rotate: 0,
  });

  const movableRef = useRef();
  const elementRef = useRef();


  useEffect(() => {
    if (movableRef && movableRef.current) {
      // @ts-ignore
      movableRef.current.updateRect();
    }
  }, [movableRef.current, outerTransform]);

  const setTransform = (transformDiff) => {
    setWholeTransform({ ...transform, ...transformDiff });
  };

  // @ts-ignore
  return (
    <g>
      <PortalizedReactMoveable
        ref={movableRef}
        portalEl={portalRef.current}
        target={elementRef.current}
        scalable
        rotatable
        draggable
        {...controllerProps}
        // @ts-ignore
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
      <g
        ref={elementRef}
        transform={`translate(${
          transform.translateX}, ${transform.translateY}) rotate(${transform.rotate}) scale(${
          transform.scaleX}, ${transform.scaleY})`}
      >
        {children}
      </g>
    </g>
  );
};
