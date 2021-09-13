import { observer } from 'mobx-react';
import React, { useMemo } from 'react';
import { TweakableReferenceWithOptionsModel } from '../keystone-tweakables/models/TweakableReferenceWithOptionsModel';
import { SimpleSelect } from './SimpleSelect';

export const TweakableReferenceSelect = observer(({
  node,
}: { node: TweakableReferenceWithOptionsModel<any, any> }) => {
  const { valuePath, label, options } = node;

  const idToOptions = useMemo(() => options.reduce((acc, option) => {
    acc[option.value.$modelId] = option;
    return acc;
  }, {}), [options]);

  return (
    <SimpleSelect
      {...{
        onChange: (e) => {
          node.setValue(idToOptions[e.target.value].value);
        },
        options: options.map(({
          label: optionLabel,
          value: { $modelId },
        }) => ({
          value: $modelId,
          label: optionLabel,
        })),
        value: node.value.$modelId,
        label,
        name: valuePath,
      }}
    />
  );
});
