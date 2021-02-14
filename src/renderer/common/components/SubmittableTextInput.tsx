import { Input } from '@material-ui/core';
import React, { createRef, useEffect } from 'react';
import parseFraction from 'parse-fraction';
import { observer } from 'mobx-react';

import { pxToUnitView, UNIT_TO_PIXELS } from '../util/geom';
import { useWorkspaceMst } from '../../DielineViewer/models/WorkspaceModel';

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
    if (inputRef.current) {
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
              setValue((num / denom) * UNIT_TO_PIXELS[displayUnit]);
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
