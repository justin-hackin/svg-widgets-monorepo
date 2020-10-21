import { createElement } from 'react';
import { observer } from 'mobx-react';
import { get, last, startCase } from 'lodash';
import { useMst } from '../../../models';

export const ControlElement = observer(({
  // @ts-ignore
  component, valuePath, label = undefined, ...props
}) => {
  if (!valuePath) { return null; }
  const store = useMst();

  const extraProps = {
    setter: (val) => {
      store.setValueAtPath(valuePath, val);
    },
    value: get(store, valuePath),
    valuePath,
    key: valuePath,
    label: label || startCase(last((valuePath.split('.')))),
  };
  return createElement(component, { ...extraProps, ...props });
});
