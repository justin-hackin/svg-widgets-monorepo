import React from 'react';
import { ControllablePrimitiveModel } from '../util/controllable-property';
import { NodeSlider } from '../NodeSlider';

export const GenericControlInput = ({ node }: { node: ControllablePrimitiveModel<any, any> }) => {
  if (node.metadata.type === 'slider') {
    return <NodeSlider node={node} />;
  }
  return null;
};
