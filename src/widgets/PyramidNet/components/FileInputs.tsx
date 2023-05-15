import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import { extractCutHolesFromSvgString } from '@/common/util/svg';
import { useWorkspaceMst } from '@/WidgetWorkspace/rootStore';
import { InvisibleTextFileInput } from '@/common/InvisibleTextFileInput';
import { RawFaceDecorationModel } from '../models/RawFaceDecorationModel';
import type { PyramidNetWidgetModel } from '../models/PyramidNetWidgetStore';

export const FileInputs = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const widgetStore = workspaceStore.selectedStore as PyramidNetWidgetModel;
  const { importFaceDialogActive } = widgetStore;

  const openWidgetInputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    if (importFaceDialogActive) {
      openWidgetInputRef?.current.click();
    }
  }, [importFaceDialogActive]);

  return (
    <InvisibleTextFileInput
      ref={openWidgetInputRef}
      changeHandler={(fileString, filePath) => {
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
