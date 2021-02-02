import React from 'react';
import { observer } from 'mobx-react';
import { startCase } from 'lodash';
import {
  applyPatch, getPath, getRoot, joinJsonPath,
} from 'mobx-state-tree';
import { PanelSliderOrTextInput } from './PanelSliderOrTextInput';
import { PanelSelect } from './PanelSelect';
import { PanelSwitch } from './PanelSwitch';
import { PanelColorPicker } from './PanelColorPicker';
import { PanelSliderUnitView } from './PanelSliderUnitView';
import { ShapeSelect } from './ShapeSelect';
import { CURRENT_UNIT } from '../util/geom';

const pxAtEndRegex = new RegExp('__PX$');
const convertPropertyToLabel = (prop: string) => (pxAtEndRegex.test(prop)
  ? `${startCase(prop.replace(pxAtEndRegex, ''))} (${CURRENT_UNIT})` : startCase(prop));

// TODO: make this component enclose the Panel* component instead of being passed its element
// eslint-disable-next-line max-len
// consider https://medium.com/@justynazet/passing-props-to-props-children-using-react-cloneelement-and-render-props-pattern-896da70b24f6

export const ControlElement = observer(({
  component, node, property, onChange = undefined, label = undefined, ...props
}) => {
  const value = node[property];
  const root = getRoot(node);

  // @ts-ignore
  const history = root.history as IUndoManagerWithGroupState;
  const valuePath = joinJsonPath([getPath(node), property]);
  const setValue = (val) => {
    applyPatch(node, {
      op: 'replace',
      path: `/${property}`,
      value: val,
    });
  };
  if (value === undefined) { return null; }
  const allProps = {
    value,
    valuePath,
    key: valuePath,
    label: label || convertPropertyToLabel(property),
    ...props,
  };
  if (component === PanelSliderOrTextInput || component === PanelSliderUnitView) {
    const SliderComponent = component as (typeof PanelSliderOrTextInput | typeof PanelSliderUnitView);
    return (
      // @ts-ignore
      <SliderComponent
        onChange={onChange || ((_, val) => {
          if (history && !history.groupActive) {
            history.startGroup(() => {
            });
          }
          setValue(val);
        })}
        onChangeCommitted={history ? () => {
          history.stopGroup();
        } : undefined}
        {...allProps}
      />
    );
  }
  if (component === PanelSelect || component === ShapeSelect) {
    const SelectComponent = component as (typeof PanelSelect | typeof ShapeSelect);
    return (
      // @ts-ignore
      <SelectComponent
        onChange={onChange || ((e) => {
          setValue(e.target.value);
        })}
        {...allProps}
      />
    );
  }
  if (component === PanelSwitch) {
    return (
      <PanelSwitch
        onChange={onChange || ((e) => {
          setValue(e.target.checked);
        })}
        {...allProps}
      />
    );
  }
  if (component === PanelColorPicker) {
    // TODO: PanelColorPicker can't follow same onChange override pattern, no event as 1st param
    return (
      <PanelColorPicker
        onChangeComplete={(color) => {
          setValue(color.hex);
        }}
        {...allProps}
      />
    );
  }
  throw new Error('Unexpected component value for ControlElement');
});
