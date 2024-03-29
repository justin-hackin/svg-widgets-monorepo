// NOTE: not used but useful for future "framework" library
import { observer } from 'mobx-react';
import React, { useMemo } from 'react';
import { TweakableReferenceWithOptionsModel } from '../models/TweakableReferenceWithOptionsModel';
import { SimpleRadio } from './SimpleRadio';
import { assertNotNullish } from '../helpers/assert';
import { ReferenceRadioMetadata } from '../types';

export const TweakableReferenceRadio = observer((
  { node }: { node: TweakableReferenceWithOptionsModel<any, ReferenceRadioMetadata<any>> },
) => {
  const {
    valuePath,
    label,
    options,
  } = node;
  // TweakableInput should ensure this
  assertNotNullish(options);
  const idToOptions = useMemo(() => options.reduce((acc, option) => {
    acc[option.value.$modelId] = option;
    return acc;
  }, {}), [options]);

  return (
    <SimpleRadio
      {...{
        onChange: (e) => {
          node.setValue(idToOptions[e.target.value].value);
        },
        options: options.map((value, index) => ({
          value: value.getRefId(),
          label: node.optionLabelMap(value, index),
        })),
        row: node.metadata.isRow,
        value: node.value.$modelId,
        label,
        name: valuePath,
      }}
    />
  );
});
