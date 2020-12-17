import React from 'react';
import { observer } from 'mobx-react';
import { startCase } from 'lodash';
import {
  applyPatch, getPath, getRoot, joinJsonPath, tryResolve,
} from 'mobx-state-tree';
import { PanelSlider } from './PanelSlider';
import { PanelSelect } from './PanelSelect';
import { PanelSwitch } from './PanelSwitch';
import { PanelColorPicker } from './PanelColorPicker';

// in order to use this component, the root of the passed node must contain history

export const ControlElement = observer(({
  component, node, property, label = undefined, ...props
}) => {
  const value = node[property];
  const root = getRoot(node);

  // @ts-ignore
  const history = tryResolve(root, '/selectedStore/history') as IUndoManagerWithGroupState;
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
    label: label || startCase(property),
    ...props,
  };
  if (component === PanelSlider) {
    return (
      <PanelSlider
        onChange={(_, val) => {
          if (history && !history.groupActive) {
            history.startGroup(() => {
            });
          }
          setValue(val);
        }}
        onChangeCommitted={history ? () => {
          history.stopGroup();
        } : undefined}
        {...allProps}
      />
    );
  }
  if (component === PanelSelect) {
    return (
      // @ts-ignore
      <PanelSelect
        onChange={(e) => {
          setValue(e.target.value);
        }}
        {...allProps}
      />
    );
  }
  if (component === PanelSwitch) {
    return (
      <PanelSwitch
        onChange={(e) => {
          setValue(e.target.checked);
        }}
        {...allProps}
      />
    );
  }
  if (component === PanelColorPicker) {
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
