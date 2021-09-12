import React from 'react';
import { NodeSlider } from '../NodeSlider';
import { TweakablePrimitiveModel } from '../keystone-tweakables/models/TweakablePrimitiveModel';

export const GenericControlInput = ({ node }: { node: TweakablePrimitiveModel<any, any> }) => {
  if (node.metadata.type === 'slider') {
    return <NodeSlider node={node} />;
  }
  return null;
};
