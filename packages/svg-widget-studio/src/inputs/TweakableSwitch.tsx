import React from 'react';
import { observer } from 'mobx-react';
import { TweakablePrimitiveModel } from '../models/TweakablePrimitiveModel';
import { SimpleSwitch } from './SimpleSwitch';
import { SwitchMetadata } from '../types';

export const TweakableSwitch = observer((
  { node, className } : { node: TweakablePrimitiveModel<boolean, SwitchMetadata>, className?: string },
) => (
  <SimpleSwitch
    className={className}
    value={node.value}
    label={node.label}
    name={node.valuePath}
    onChange={(e) => {
      node.setValue(e.target.checked);
    }}
  />
));
