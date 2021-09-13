import React from 'react';
import { observer } from 'mobx-react';
import { TweakablePrimitiveModel } from '../models/TweakablePrimitiveModel';
import { SwitchMetadata } from '../types';
import { SimpleSwitch } from './SimpleSwitch';

export const TweakableSwitch = observer((
  { node } : { node: TweakablePrimitiveModel<boolean, SwitchMetadata> },
) => {
  if (node.value === undefined) { return null; }
  return (
    <SimpleSwitch
      value={node.value}
      label={node.label}
      name={node.valuePath}
      onChange={(e) => {
        node.setValue(e.target.checked);
      }}
    />
  );
});
