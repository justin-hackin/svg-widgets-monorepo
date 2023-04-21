/* eslint-disable max-classes-per-file,no-param-reassign */
import ReactDOMServer from 'react-dom/server';
import React from 'react';

import {
  ExtendedModel, model, modelAction, prop,
} from 'mobx-keystone';
import { computed, observable } from 'mobx';
import { persist } from 'mobx-keystone-persist';
import { PyramidNetModel } from './PyramidNetStore';
import { getBoundingBoxAttrs } from '../../../common/util/svg';
import { RawFaceDecorationModel } from './RawFaceDecorationModel';
import { TextureEditorModel }
  from '../components/TextureEditorDrawer/components/TextureEditor/models/TextureEditorModel';
import { dashPatternsDefaultFn, StrokeDashPathPatternModel } from '../../../common/path/shapes/strokeDashPath';
import { DecorationBoundarySVG } from '../components/DecorationBoundarySVG';
import { PrintLayer } from '../components/PrintLayer';
import { DielinesLayer } from '../components/DielinesLayer';
import { PyramidNetPreferencesModel } from './PyramidNetPreferencesModel';
import { AdditionalFileMenuItems } from '../components/AdditionalFileMenuItems';
import { PanelContent } from '../components/PanelContent';
import { TextureEditorDrawer } from '../components/TextureEditorDrawer';
import { AdditionalToolbarContent } from '../components/AdditionalToolbarContent';
import { BaseWidgetClass } from '../../../WidgetWorkspace/widget-types/BaseWidgetClass';
import { RegisteredAssetsDefinition } from '../../../WidgetWorkspace/widget-types/RegisteredAssetsDefinition';

const PREFERENCES_LOCALSTORE_NAME = 'PyramidNetPreferencesModel';

@model('PolyhedralNet')
export class PyramidNetWidgetModel extends ExtendedModel(BaseWidgetClass, {
  persistedSpec: prop<PyramidNetModel>(() => (new PyramidNetModel({}))),
  textureEditor: prop<TextureEditorModel>(() => (new TextureEditorModel({}))),
  dashPatterns: prop<StrokeDashPathPatternModel[]>(dashPatternsDefaultFn),
  preferences: prop(() => (new PyramidNetPreferencesModel({}))),
}) {
  @observable
  textureEditorOpen = false;

  onAttachedToRootStore() {
    this.persistPreferences();
  }

  @computed
  get boundingBox() {
    return getBoundingBoxAttrs(this.persistedSpec.netPaths.cut.getD());
  }

  @computed
  get documentAreaProps() {
    return { width: this.preferences.documentWidth.value, height: this.preferences.documentHeight.value };
  }

  @computed
  get assetDefinition() {
    const documentAreaProps = {
      width: this.preferences.documentWidth.value,
      height: this.preferences.documentHeight.value,
    };
    return new RegisteredAssetsDefinition(
      documentAreaProps,
      [
        {
          name: 'Print',
          Component: () => (<PrintLayer widgetStore={this} />),
          copies: this.persistedSpec.pyramid.copiesNeeded,
        },
        {
          name: 'Dielines',
          Component: () => (<DielinesLayer widgetStore={this} />),
          copies: this.persistedSpec.pyramid.copiesNeeded,
        },
      ],
    );
  }

  @modelAction
  setTextureEditorOpen(isOpen) {
    if (this.persistedSpec.faceDecoration instanceof RawFaceDecorationModel) {
      // texture editor directly references faceDecoration and will not render TextureSvg if it is Raw
      this.persistedSpec.resetFaceDecoration();
    }
    this.textureEditorOpen = isOpen;
  }

  @modelAction
  renderDecorationBoundaryToString():string {
    // @ts-ignore
    return ReactDOMServer.renderToString(React.createElement(DecorationBoundarySVG, { store: this }));
  }

  get fileBasename() {
    return `${
      this.persistedSpec.pyramid.shapeName.value || 'shape'
    }__${
      this.persistedSpec.faceDecorationSourceFileName || 'undecorated'
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

  PanelContent = PanelContent;

  AdditionalToolbarContent = AdditionalToolbarContent;

  AdditionalFileMenuItems = AdditionalFileMenuItems;

  AdditionalMainContent = TextureEditorDrawer;
}
