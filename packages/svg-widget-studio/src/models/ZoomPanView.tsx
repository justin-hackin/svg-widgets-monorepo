import { model, Model, prop } from 'mobx-keystone';
import {
  ALIGN_CENTER, fitToViewer, Tool, TOOL_PAN, Value, zoomOnViewerCenter,
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
    // types are wrong
    // @ts-ignore
    const fitValue = fitToViewer(this.value, ALIGN_CENTER, ALIGN_CENTER);
    this.setValue(zoomOnViewerCenter(fitValue, 0.9));
  }
}
