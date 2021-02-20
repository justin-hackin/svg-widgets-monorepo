import { Input } from '@material-ui/core';
import React, { createRef, useEffect } from 'react';
import parseFraction from 'parse-fraction';
import { observer } from 'mobx-react';

import { useWorkspaceMst } from '../../DielineViewer/models/WorkspaceModel';
import { pxToUnitView, PIXELS_PER_UNIT } from '../util/units';

export const SubmittableTextInput = observer(({
  value,
  setValue,
  valuePath,
  labelId,
  useUnits = false,
}) => {
  const { preferences: { displayUnit } } = useWorkspaceMst();
  const inputRef = createRef<HTMLInputElement>();
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
              setValue((num / denom) * PIXELS_PER_UNIT[displayUnit]);
              // eslint-disable-next-line no-empty
            } catch (_) {
            }
          } else {
            const parsedFloat = parseFloat(stringValue);
            if (!Number.isNaN(parsedFloat)) {
              setValue(parsedFloat);
            }
          }
        }
      }}
      inputProps={{ 'aria-label': labelId }}
    />
  );
});
