import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import { useWorkspaceMst } from '../rootStore';
import { InvisibleTextFileInput } from '../../common/InvisibleTextFileInput';

export const FileInputs = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { openWidgetFileFlag } = workspaceStore;

  const openWidgetInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (openWidgetFileFlag) {
      openWidgetInputRef?.current?.click();
    }
  }, [openWidgetFileFlag]);

  return (
    <InvisibleTextFileInput
      ref={openWidgetInputRef}
      changeHandler={(txt) => {
        workspaceStore.deactivateWidgetFilePicker();
        workspaceStore.initializeWidgetFromSnapshot(JSON.parse(txt));
      }}
      accept=".widget"
    />
  );
});
