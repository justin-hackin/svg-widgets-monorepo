import React, { useState } from 'react';
import TrackChangesIcon from '@material-ui/icons/TrackChanges';
import { Button, Menu, MenuItem } from '@material-ui/core';
import { observer } from 'mobx-react';
import { range } from 'lodash';

import { useWorkspaceMst } from '../../../../../../renderer/DielineViewer/models/WorkspaceModel';
import { IPyramidNetPluginModel } from '../../../../../../renderer/DielineViewer/models/PyramidNetMakerStore';
import { ITextureEditorModel } from '../../../models/TextureEditorModel';
import { TOUR_ELEMENT_CLASSES } from '../../../../../util/tour';

export const SnapMenu = observer(() => {
  // when truthy, snap menu is open
  const [positionSnapMenuAnchorEl, setPositionSnapMenuAnchorEl] = useState(null);

  const workspaceStore = useWorkspaceMst();
  const pluginModel:IPyramidNetPluginModel = workspaceStore.selectedStore;

  const {
    texture, decorationBoundary,
    selectedTextureNodeIndex, showNodes,
    repositionTextureWithOriginOverCorner, repositionOriginOverCorner, repositionSelectedNodeOverCorner,
    repositionTextureWithOriginOverFaceCenter, repositionOriginOverFaceCenter, repositionSelectedNodeOverFaceCenter,
    repositionOriginOverTextureCenter,
    refitTextureToFace,
  } = pluginModel.textureEditor as ITextureEditorModel;

  if (!texture || !decorationBoundary) {
    return null;
  }

  const numFaceSides = decorationBoundary.vertices.length;

  const handleCornerSnapMenuClick = (event) => {
    setPositionSnapMenuAnchorEl(event.currentTarget);
  };

  const resetPositionSnapMenuAnchorEl = () => { setPositionSnapMenuAnchorEl(null); };

  const fitTextureToFaceSnapMenuOnclick = () => {
    refitTextureToFace();
    resetPositionSnapMenuAnchorEl();
  };

  const textureOriginToFaceCenterSnapMenuOnclick = () => {
    repositionTextureWithOriginOverFaceCenter();
    resetPositionSnapMenuAnchorEl();
  };

  const textureOriginToCornerSnapMenuOnclick = (index) => {
    if (index !== undefined) {
      repositionTextureWithOriginOverCorner(index);
    }
    resetPositionSnapMenuAnchorEl();
  };

  const originToFaceCenterSnapMenuOnclick = () => {
    repositionOriginOverFaceCenter();
    resetPositionSnapMenuAnchorEl();
  };

  const originToTextureCenterSnapMenuOnclick = () => {
    repositionOriginOverTextureCenter();
    resetPositionSnapMenuAnchorEl();
  };

  const originToCornerSnapMenuOnclick = (index) => {
    if (index !== undefined) {
      repositionOriginOverCorner(index);
    }
    resetPositionSnapMenuAnchorEl();
  };

  const selectedNodeToCornerSnapMenuOnclick = (index) => {
    if (index !== undefined) {
      repositionSelectedNodeOverCorner(index);
    }
    resetPositionSnapMenuAnchorEl();
  };

  const selectedNodeToFaceCenterSnapMenuOnclick = () => {
    repositionSelectedNodeOverFaceCenter();
    resetPositionSnapMenuAnchorEl();
  };

  return (
    <>
      <Button
        className={TOUR_ELEMENT_CLASSES.SNAP_MENU}
        startIcon={<TrackChangesIcon />}
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleCornerSnapMenuClick}
      >
        Snap
      </Button>

      {/* ===================== SNAP MENU ===================== */}
      <Menu
        id="simple-menu"
        anchorEl={positionSnapMenuAnchorEl}
        keepMounted
        variant="menu"
        open={Boolean(positionSnapMenuAnchorEl)}
        onClose={() => {
          resetPositionSnapMenuAnchorEl();
        }}
      >
        <MenuItem
          onClick={() => {
            fitTextureToFaceSnapMenuOnclick();
          }}
        >
          Fit texture onto face
        </MenuItem>
        <MenuItem
          onClick={() => {
            textureOriginToFaceCenterSnapMenuOnclick();
          }}
        >
          Texture & origin to face center
        </MenuItem>
        {range(numFaceSides).map((index) => (
          <MenuItem
            key={index}
            onClick={() => {
              textureOriginToCornerSnapMenuOnclick(index);
            }}
          >
            Texture & origin to corner
            {' '}
            {index + 1}
          </MenuItem>
        ))}
        <MenuItem
          onClick={() => {
            originToFaceCenterSnapMenuOnclick();
          }}
        >
          Origin to face center
        </MenuItem>
        <MenuItem
          onClick={() => {
            originToTextureCenterSnapMenuOnclick();
          }}
        >
          Origin to texture center
        </MenuItem>
        {range(numFaceSides).map((index) => (
          <MenuItem
            key={index}
            onClick={() => {
              originToCornerSnapMenuOnclick(index);
            }}
          >
            Origin to corner
            {' '}
            {index + 1}
          </MenuItem>
        ))}

        {showNodes && selectedTextureNodeIndex !== null && (
          <>
            <MenuItem
              onClick={() => {
                selectedNodeToFaceCenterSnapMenuOnclick();
              }}
            >
              Selected node to face center
            </MenuItem>
            {range(numFaceSides).map((index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  selectedNodeToCornerSnapMenuOnclick(index);
                }}
              >
                Selected node to corner
                {' '}
                {index + 1}
              </MenuItem>
            ))}
          </>
        )}
      </Menu>
    </>
  );
});
