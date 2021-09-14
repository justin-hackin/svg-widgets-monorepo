import React from 'react';
import { INPUT_TYPE, TweakableModel } from '../types';
import { TweakableSlider } from './TweakableSlider';
import { TweakableRadio} from './TweakableRadio';
import { TweakableColorPicker } from './TweakableColorPicker';
import { TweakableNumberTextInput } from './TweakableNumberTextInput';
import { TweakableSelect } from './TweakableSelect';
import { TweakableSwitch } from './TweakableSwitch';
import { TweakableSliderOrTextInput } from './TweakableSliderOrTextInput';
import { TweakableReferenceRadio } from './TweakableReferenceRadio';
import { TweakableReferenceSelect } from './TweakableReferenceSelect';

const TYPE_COMPONENT_MAP = {
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

export const TweakableInput = (
  { node, className }:
  { node: TweakableModel, className?: string },
) => {
  const Component = TYPE_COMPONENT_MAP[node.metadata.type];
  // @ts-ignore
  return <Component className={className} node={node} />;
};
