import {INPUT_TYPE, TweakableModel} from '../types';
import {AnyModel, findChildren} from 'mobx-keystone';
import {TweakableInput} from './TweakableInput';
import React from 'react';

const INPUT_TYPES_VALUES = Object.values(INPUT_TYPE);

export const TweakableChildrenInputs = ({parentNode}: {parentNode: AnyModel}) => {
  const children = findChildren(parentNode,(child) => INPUT_TYPES_VALUES.includes((child as TweakableModel)?.metadata?.type));
  return (<>
    {Array.from(children).map(
      (node: TweakableModel) => <TweakableInput key={node.valuePath} node={node}/>)}
  </>);
}
