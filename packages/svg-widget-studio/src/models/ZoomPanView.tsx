import { model, Model, prop } from 'mobx-keystone';
import {
  fitToViewer, Tool, TOOL_PAN, Value,
} from 'react-svg-pan-zoom';
import { action } from 'mobx';

@model('SVGWidgetStudio/ZoomPanVew')
export class ZoomPanView extends Model({
  value: prop<Value>(() => ({} as Value))
    .withSetter(),
  tool: prop<Tool>(TOOL_PAN)
    .withSetter(),
}) {
  @action
  fitToDocument() {
    this.setValue(fitToViewer(this.value));
  }
}
