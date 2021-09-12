import { Input } from '@material-ui/core';
import React, { createRef, useEffect } from 'react';
import parseFraction from 'parse-fraction';
import { observer } from 'mobx-react';

import { useWorkspaceMst } from '../../renderer/DielineViewer/models/WorkspaceModel';
import { pxToUnitView, PIXELS_PER_UNIT } from '../util/units';
import { ControllablePrimitiveModel, NumberTextMetadata, SliderWithTextMetadata } from '../util/controllable-property';

export const NodeUnlabelledNumberTextInput = observer(({
  node, labelId,
}: { node: ControllablePrimitiveModel<number, (NumberTextMetadata | SliderWithTextMetadata)>, labelId: string }) => {
  const { preferences: { displayUnit: { value: displayUnit } } } = useWorkspaceMst();
  const inputRef = createRef<HTMLInputElement>();
  const { value, valuePath, metadata: { useUnits } } = node;
  useEffect(() => {
    if (inputRef.current && useUnits) {
      inputRef.current.value = pxToUnitView(value, displayUnit);
    }
  }, [displayUnit]);

  return (
    <Input
      inputRef={inputRef}
      defaultValue={useUnits ? pxToUnitView(value, displayUnit) : value}
      name={valuePath}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          const stringValue = (e.target as HTMLInputElement).value;
          if (useUnits) {
            try {
              const [num, denom] = parseFraction(stringValue);
              node.setValue((num / denom) * PIXELS_PER_UNIT[displayUnit]);
              // eslint-disable-next-line no-empty
            } catch (_) {
            }
          } else {
            const parsedFloat = parseFloat(stringValue);
            if (!Number.isNaN(parsedFloat)) {
              node.setValue(parsedFloat);
            }
          }
        }
      }}
      inputProps={{ 'aria-label': labelId }}
    />
  );
});
