/* eslint-disable max-classes-per-file,no-param-reassign */
import ReactDOMServer from 'react-dom/server';
import React from 'react';

import {
  model, Model, modelAction, prop,
} from 'mobx-keystone';
import { computed, observable } from 'mobx';
import { PyramidNetModel } from './PyramidNetStore';
import { getBoundingBoxAttrs } from '../../../common/util/svg';
import { RawFaceDecorationModel } from './RawFaceDecorationModel';
import { TextureEditorModel }
  from '../components/TextureEditorDrawer/components/TextureEditor/models/TextureEditorModel';
import { dashPatternsDefaultFn, StrokeDashPathPatternModel } from '../../../common/path/shapes/strokeDashPath';
import { DecorationBoundarySVG } from '../components/DecorationBoundarySVG';

@model('PyramidNetWidgetModel')
export class PyramidNetWidgetModel extends Model({
  savedModel: prop<PyramidNetModel>(() => (new PyramidNetModel({}))),
  textureEditor: prop<TextureEditorModel>(() => (new TextureEditorModel({}))),
  dashPatterns: prop<StrokeDashPathPatternModel[]>(dashPatternsDefaultFn),
}) {
  @observable
  textureEditorOpen = false;

  @computed
  get boundingBox() {
    return getBoundingBoxAttrs(this.savedModel.netPaths.cut.getD());
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
}
