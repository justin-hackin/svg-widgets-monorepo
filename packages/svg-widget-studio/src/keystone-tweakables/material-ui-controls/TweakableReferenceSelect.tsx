import { observer } from 'mobx-react';
import React, { useMemo } from 'react';
import { TweakableReferenceWithOptionsModel } from '../models/TweakableReferenceWithOptionsModel';
import { SimpleSelect } from './SimpleSelect';
import { assertNotNullish } from '../../helpers/assert';

export const TweakableReferenceSelect = observer(({
  node,
}: { node: TweakableReferenceWithOptionsModel<any, any> }) => {
  const { valuePath, label, options } = node;
  // TweakableInput should ensure this
  assertNotNullish(options);

  const idToOptions = useMemo(() => options.reduce((acc, option) => {
    acc[option.getRefId()] = option;
    return acc;
  }, {}), [options]);

  return (
    <SimpleSelect
      {...{
        onChange: (e) => {
          node.setValue(idToOptions[e.target.value]);
        },
        options: options.map((value, index) => ({
          value: value.getRefId(),
          label: node.optionLabelMap(value, index),
        })),
        value: node.value?.getRefId(),
        label,
        name: valuePath,
      }}
    />
  );
});
