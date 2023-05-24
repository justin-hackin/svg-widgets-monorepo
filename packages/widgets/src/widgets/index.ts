import { PyramidNetWidgetModel } from '@/widgets/PyramidNet/models/PyramidNetWidgetStore';
import { CylinderLightboxWidgetModel } from '@/widgets/CylinderLightbox';
import { SquareGridDividerWidgetModel } from '@/widgets/CrosshatchShelves/SquareGridDividerWidgetModel';
import { DiamondGridDividerWidgetModel } from '@/widgets/CrosshatchShelves/DiamondGridDividerWidgetModel';
import { TriangularGridWidgetModel } from '@/widgets/CrosshatchShelves/TriangularGrid';
import { workspaceStore } from '@/WidgetWorkspace/rootStore';

// eslint-disable-next-line no-console
console.log('Widgets: ', [
  PyramidNetWidgetModel,
  CylinderLightboxWidgetModel,
  SquareGridDividerWidgetModel,
  DiamondGridDividerWidgetModel,
  TriangularGridWidgetModel,
]);

workspaceStore.widgetsReady();
