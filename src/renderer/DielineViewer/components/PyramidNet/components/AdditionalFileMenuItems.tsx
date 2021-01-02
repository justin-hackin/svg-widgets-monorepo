import React from 'react';
import { MenuItem } from '@material-ui/core';

import { useWorkspaceMst } from '../../../models/WorkspaceModel';
import { IPyramidNetFactoryModel } from '../../../models/PyramidNetMakerStore';
import { EVENTS } from '../../../../../main/ipc';
import { extractCutHolesFromSvgString } from '../../../../../common/util/svg';

export const AdditionalFileMenuItems = ({ resetFileMenuRef }) => {
  const workspaceStore = useWorkspaceMst();
  const store = workspaceStore.selectedStore as IPyramidNetFactoryModel;
  return (
    <>
      <MenuItem onClick={async () => {
        await globalThis.ipcRenderer.invoke(EVENTS.SAVE_SVG, store.renderDecorationBoundaryToString(), {
          message: 'Save face template',
          defaultPath: `${store.pyramidNetSpec.pyramid.shapeName}__template.svg`,
        });
        resetFileMenuRef();
      }}
      >
        Download face template SVG (current shape)
      </MenuItem>
      <MenuItem onClick={async () => {
        await globalThis.ipcRenderer.invoke(EVENTS.OPEN_SVG, 'Upload face cut pattern')
          .then((svgString) => {
            const d = extractCutHolesFromSvgString(svgString);
            store.pyramidNetSpec.setRawFaceDecoration(d);
          });
        resetFileMenuRef();
      }}
      >
        Import face cut path from template
      </MenuItem>
    </>
  );
};
