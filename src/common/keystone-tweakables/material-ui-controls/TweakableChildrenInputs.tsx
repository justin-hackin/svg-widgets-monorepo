import {INPUT_TYPE, TweakableModel} from '../types';
import {findChildren} from 'mobx-keystone';
import {TweakableInput} from './TweakableInput';
import React from 'react';

const INPUT_TYPES_VALUES = Object.values(INPUT_TYPE);

type childrenFilter = (child: object)=>boolean;

export const TweakableChildrenInputs = ({parentNode, childrenFilter}: {parentNode: object, childrenFilter?: childrenFilter}) => {
  const children = findChildren(parentNode,(child) => INPUT_TYPES_VALUES.includes((child as TweakableModel)?.metadata?.type) && (!childrenFilter || childrenFilter(child)));
  return (<>
    {Array.from(children).map(
      (node: TweakableModel) => <TweakableInput key={node.valuePath} node={node}/>)}
  </>);
}
