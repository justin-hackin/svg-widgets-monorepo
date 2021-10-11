import React from 'react';
import { observer } from 'mobx-react';
import { TweakablePrimitiveWithOptionsModel } from '../models/TweakablePrimitiveWithOptionsModel';
import { RadioMetadata } from '../types';
import { SimpleRadio } from './SimpleRadio';

export const TweakableRadio = observer((
  { node }: { node: TweakablePrimitiveWithOptionsModel<any, RadioMetadata<any>> },
) => (
  <SimpleRadio
    {...{
      onChange: (e) => {
        const value = node.metadata.valueParser ? node.metadata.valueParser(e.target.value) : e.target.value;
        node.setValue(value);
      },
      options: node.options,
      row: node.metadata.isRow,
      value: node.value,
      label: node.label,
      name: node.valuePath,
    }}
  />
));
