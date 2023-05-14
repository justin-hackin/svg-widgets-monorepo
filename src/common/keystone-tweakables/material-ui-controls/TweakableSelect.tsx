import React from 'react';
import { observer } from 'mobx-react';
import { TweakablePrimitiveWithOptionsModel } from '../models/TweakablePrimitiveWithOptionsModel';
import { SimpleSelect } from './SimpleSelect';

export const TweakableSelect = observer(({
  node,
}: { node: TweakablePrimitiveWithOptionsModel<any, any> }) => {
  const {
    valuePath, label, options,
  } = node;

  return (
    <SimpleSelect
      {...{
        onChange: (e) => {
          node.setValue(e.target.value);
        },
        options,
        value: node.value,
        label,
        name: valuePath,
      }}
    />
  );
});
