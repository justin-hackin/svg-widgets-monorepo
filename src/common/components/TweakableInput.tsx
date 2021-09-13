import React from 'react';
import { INPUT_TYPE, TweakableModel } from '../keystone-tweakables/types';
import { NodeSlider } from '../NodeSlider';
import { NodeRadio, NodeReferenceRadio } from './NodeRadio';
import { NodeColorPicker } from './NodeColorPicker';
import { NodeNumberTextInput } from './NodeNumberTextInput';
import { NodeReferenceSelect, NodeSelect } from './NodeSelect';
import { NodeSwitch } from './NodeSwitch';
import { NodeSliderOrTextInput } from './NodeSliderOrTextInput';

const TYPE_COMPONENT_MAP = {
  [INPUT_TYPE.SWITCH]: NodeSwitch,
  [INPUT_TYPE.SLIDER]: NodeSlider,
  [INPUT_TYPE.NUMBER_TEXT]: NodeNumberTextInput,
  [INPUT_TYPE.RADIO]: NodeRadio,
  [INPUT_TYPE.COLOR_PICKER]: NodeColorPicker,
  [INPUT_TYPE.SLIDER_WITH_TEXT]: NodeSliderOrTextInput,
  [INPUT_TYPE.SELECT]: NodeSelect,
  [INPUT_TYPE.REFERENCE_RADIO]: NodeReferenceRadio,
  [INPUT_TYPE.REFERENCE_SELECT]: NodeReferenceSelect,
};

export const TweakableInput = (
  { node, className }:
  { node: TweakableModel, className?: string },
) => {
  const Component = TYPE_COMPONENT_MAP[node.metadata.type];
  // @ts-ignore
  return <Component className={className} node={node} />;
};
