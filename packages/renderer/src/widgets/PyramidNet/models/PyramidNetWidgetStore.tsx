/* eslint-disable max-classes-per-file,no-param-reassign */
import ReactDOMServer from 'react-dom/server';
import React from 'react';

import {
  model, Model, modelAction, prop,
} from 'mobx-keystone';
import { computed, observable } from 'mobx';
import { persist } from 'mobx-keystone-persist';
import { Button, Tooltip } from '@material-ui/core';
import BrushIcon from '@material-ui/icons/Brush';
import { PyramidNetModel } from './PyramidNetStore';
import { getBoundingBoxAttrs } from '../../../common/util/svg';
import { RawFaceDecorationModel } from './RawFaceDecorationModel';
import { TextureEditorModel }
  from '../components/TextureEditorDrawer/components/TextureEditor/models/TextureEditorModel';
import { dashPatternsDefaultFn, StrokeDashPathPatternModel } from '../../../common/path/shapes/strokeDashPath';
import { DecorationBoundarySVG } from '../components/DecorationBoundarySVG';
import { WidgetModel } from '../../../WidgetWorkspace/types';
import { PrintLayer } from '../components/PrintLayer';
import { DielinesLayer } from '../components/DielinesLayer';
import { PyramidNetPreferencesModel } from './PyramidNetPreferencesModel';
import { useStyles } from '../../../common/style/style';
import { HistoryButtons } from '../components/HistoryButtons';

const PREFERENCES_LOCALSTORE_NAME = 'preferencesStoreLocal';

@model('PyramidNetWidgetModel')
export class PyramidNetWidgetModel extends Model({
  savedModel: prop<PyramidNetModel>(() => (new PyramidNetModel({}))),
  textureEditor: prop<TextureEditorModel>(() => (new TextureEditorModel({}))),
  dashPatterns: prop<StrokeDashPathPatternModel[]>(dashPatternsDefaultFn),
  preferences: prop(() => (new PyramidNetPreferencesModel({}))),
}) implements WidgetModel {
  @observable
  textureEditorOpen = false;

  onAttachedToRootStore() {
    this.persistPreferences();
  }

  @computed
  get boundingBox() {
    return getBoundingBoxAttrs(this.savedModel.netPaths.cut.getD());
  }

  @computed
  get documentAreaProps() {
    return { width: this.preferences.documentWidth.value, height: this.preferences.documentHeight.value };
  }

  @modelAction
  setTextureEditorOpen(isOpen) {
    if (this.savedModel.faceDecoration instanceof RawFaceDecorationModel) {
      // texture editor directly references faceDecoration and will not render TextureSvg if it is Raw
      this.savedModel.resetFaceDecoration();
    }
    this.textureEditorOpen = isOpen;
  }

  @modelAction
  renderDecorationBoundaryToString():string {
    // @ts-ignore
    return ReactDOMServer.renderToString(React.createElement(DecorationBoundarySVG, { store: this }));
  }

  @modelAction
  getFileBasename() {
    return `${
      this.savedModel.pyramid.shapeName.value || 'shape'
    }__${
      this.savedModel.faceDecorationSourceFileName || 'undecorated'
    }`;
  }

  @modelAction
  persistPreferences() {
    return persist(PREFERENCES_LOCALSTORE_NAME, this.preferences)
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.warn('Failed to persist preferences, likely due to data schema changes, '
          + 'resetting preferences to defaults: ', e.message);
        this.resetPreferences();
        return persist(PREFERENCES_LOCALSTORE_NAME, this.preferences);
      });
  }

  // TODO: make DRY with WorkspacePreferences
  @modelAction
  resetPreferences() {
    localStorage.removeItem(PREFERENCES_LOCALSTORE_NAME);
    this.preferences = new PyramidNetPreferencesModel({});
    this.persistPreferences();
  }

  WidgetSVG = () => (
    <>
      <PrintLayer widgetStore={this} />
      <DielinesLayer widgetStore={this} />
    </>
  );

  AdditionalToolbarContent = () => {
    const classes = useStyles();
    const { savedModel: { history } } = this;
    return (
      <>
        { history && (<HistoryButtons history={history} />)}

        <Tooltip title="Open texture editor" arrow>
          <Button
            className={classes.dielinePanelButton}
            startIcon={<BrushIcon />}
            onClick={() => { this.setTextureEditorOpen(true); }}
          >
            Texture
          </Button>
        </Tooltip>
      </>
    );
  };
}
