import { findChildren } from 'mobx-keystone';
import React from 'react';
import { TweakableInput } from './TweakableInput';
import { INPUT_TYPE, TweakableModel } from '../types';

const INPUT_TYPES_VALUES = Object.values(INPUT_TYPE);

type childrenFilter = (child: object)=>boolean;

export function TweakableChildrenInputs({ parentNode, childrenFilter, recursive = false }:
{ parentNode: object, childrenFilter?: childrenFilter, recursive?: boolean }) {
  if (!parentNode) { return null; }
  const children = findChildren(parentNode, (child) => (
    INPUT_TYPES_VALUES.includes((child as TweakableModel)?.metadata?.type)
    && (!childrenFilter || childrenFilter(child))), { deep: recursive });
  return (
    <>
      {Array.from(children).map(
        (node: TweakableModel) => <TweakableInput key={node.valuePath} node={node} />,
      )}
    </>
  );
}
