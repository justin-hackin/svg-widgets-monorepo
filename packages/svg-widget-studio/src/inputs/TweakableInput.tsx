import React, { FC } from 'react';
import { observer } from 'mobx-react';
import { TweakableSlider } from './TweakableSlider';
import { TweakableRadio } from './TweakableRadio';
import { TweakableColorPicker } from './TweakableColorPicker';
import { TweakableNumberTextInput } from './TweakableNumberTextInput';
import { TweakableSelect } from './TweakableSelect';
import { TweakableSwitch } from './TweakableSwitch';
import { TweakableSliderOrTextInput } from './TweakableSliderOrTextInput';
import { TweakableReferenceRadio } from './TweakableReferenceRadio';
import { TweakableReferenceSelect } from './TweakableReferenceSelect';
import { TweakableModel } from '../types';
import { INPUT_TYPE } from '../internal/constants';

const TYPE_COMPONENT_MAP: Record<
INPUT_TYPE,
FC<{ node: any, className?: string }>
> = {
  [INPUT_TYPE.SWITCH]: TweakableSwitch,
  [INPUT_TYPE.SLIDER]: TweakableSlider,
  [INPUT_TYPE.NUMBER_TEXT]: TweakableNumberTextInput,
  [INPUT_TYPE.RADIO]: TweakableRadio,
  [INPUT_TYPE.COLOR_PICKER]: TweakableColorPicker,
  [INPUT_TYPE.SLIDER_WITH_TEXT]: TweakableSliderOrTextInput,
  [INPUT_TYPE.SELECT]: TweakableSelect,
  [INPUT_TYPE.REFERENCE_RADIO]: TweakableReferenceRadio,
  [INPUT_TYPE.REFERENCE_SELECT]: TweakableReferenceSelect,
};

export const TweakableInput = observer(({ node, className }:
{ node: TweakableModel, className?: string }) => {
  if (!node || !node.metadata) { return null; }
  const Component = TYPE_COMPONENT_MAP[node.metadata.type];
  return <Component className={className} node={node} />;
});
