import React from 'react';
import { NodeSlider } from '../NodeSlider';
import { ControllablePrimitiveModel } from '../keystone-tweakables/models/ControllablePrimitiveModel';

export const GenericControlInput = ({ node }: { node: ControllablePrimitiveModel<any, any> }) => {
  if (node.metadata.type === 'slider') {
    return <NodeSlider node={node} />;
  }
  return null;
};
