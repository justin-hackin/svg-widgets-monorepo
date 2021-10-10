import { observer } from 'mobx-react';
import React, { useMemo } from 'react';
import { TweakableReferenceWithOptionsModel } from '../models/TweakableReferenceWithOptionsModel';
import { SimpleSelect } from './SimpleSelect';

export const TweakableReferenceSelect = observer(({
  node,
}: { node: TweakableReferenceWithOptionsModel<any, any> }) => {
  const { valuePath, label, options } = node;

  const idToOptions = useMemo(() => options.reduce((acc, option) => {
    acc[option.value.getRefId()] = option;
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
          value,
        }) => ({
          value: value.getRefId(),
          label: optionLabel,
        })),
        value: node.value.getRefId(),
        label,
        name: valuePath,
      }}
    />
  );
});
