import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import { InvisibleTextFileInput, useSelectedStore } from 'svg-widget-studio';
import type { PyramidNetWidgetModel } from '../models/PyramidNetWidgetStore';
import { RawFaceDecorationModel } from '../models/RawFaceDecorationModel';
import { extractCutHolesFromSvgString } from '../../../common/util/svg';

export const FileInputs = observer(() => {
  const widgetStore = useSelectedStore<PyramidNetWidgetModel>();
  // TODO: route renders content before store is available, not optimal
  const { importFaceDialogActive } = widgetStore || {};

  const openWidgetInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (importFaceDialogActive) {
      openWidgetInputRef?.current?.click();
    }
  }, [importFaceDialogActive]);
  if (!widgetStore) { return null; }

  return (
    <InvisibleTextFileInput
      ref={openWidgetInputRef}
      changeHandler={(fileString, filePath) => {
        if (!filePath) {
          return;
        }
        widgetStore.deactivateImportFaceDialog();
        const dValue = extractCutHolesFromSvgString(fileString);

        // This file should have a .svg extension, without an extension this will be ''
        const baseFileName = filePath.split('.').slice(0, -1).join('.');
        widgetStore.setFaceDecoration(new RawFaceDecorationModel({ dValue, sourceFileName: baseFileName }));
      }}
      accept=".svg"
    />
  );
});
