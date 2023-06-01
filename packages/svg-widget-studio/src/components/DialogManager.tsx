import { action, makeObservable, observable } from 'mobx';
import { ReactNode } from 'react';

export class DialogManager {
  constructor() {
    makeObservable(this);
  }

  @observable
    settingsDialogIsActive = false;

  @action
  setSettingsDialogIsActive(active) {
    this.settingsDialogIsActive = active;
  }

  @observable
    alertDialogContent: ReactNode | null = null;

  @observable
    downloadPromptInitialText: string | undefined = undefined;

  @action
  setDownloadPromptInitialText(fileBasename) {
    this.downloadPromptInitialText = fileBasename;
  }

  @observable
    openWidgetFileFlag = false;

  @action
  _setFileDialogActive(isActive: boolean) {
    if (isActive === this.openWidgetFileFlag) {
      throw new Error(
        '_setFileDialogActive: expected parameter isActive to be different than existing value for openWidgetFileFlag',
      );
    }
    this.openWidgetFileFlag = isActive;
  }

  @action
  activateOpenWidgetFilePicker() {
    this._setFileDialogActive(true);
  }

  @action
  deactivateWidgetFilePicker() {
    this._setFileDialogActive(false);
  }

  @action
  setAlertDialogContent(content: ReactNode) {
    this.alertDialogContent = content;
  }

  @action
  resetAlertDialogContent() {
    this.alertDialogContent = null;
  }
}
