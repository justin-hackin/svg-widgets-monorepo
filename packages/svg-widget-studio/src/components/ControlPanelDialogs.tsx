import { observer } from 'mobx-react';
import React from 'react';
import { useWorkspaceMst } from '../rootStore';
import { SimpleDialog } from '../inputs/SimpleDialog';
import { PreferencesControls } from './PreferencesControls';
import { DownloadPromptDialog } from './DownloadPromptDialog';

export const ControlPanelDialogs = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { dialogManager } = workspaceStore;

  return (
    <>
      <SimpleDialog
        isOpen={!!dialogManager.alertDialogContent}
        handleClose={() => {
          dialogManager.resetAlertDialogContent();
        }}
        title="Error"
      >
        {dialogManager.alertDialogContent}
      </SimpleDialog>
      <SimpleDialog
        isOpen={dialogManager.settingsDialogIsActive}
        handleClose={() => {
          dialogManager.setSettingsDialogIsActive(false);
        }}
        title="Settings"
      >
        <PreferencesControls />
      </SimpleDialog>
      <DownloadPromptDialog
        open={!!dialogManager.downloadPromptInitialText}
        initialValue={dialogManager.downloadPromptInitialText}
        handleClose={(fileBasename) => {
          debugger;
          workspaceStore.downloadWidgetWithAssets(fileBasename);
          dialogManager.setDownloadPromptInitialText(undefined);
        }}
      />
    </>
  );
});
