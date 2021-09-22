import React, { useState } from 'react';
import TrackChangesIcon from '@material-ui/icons/TrackChanges';
import { Button, Menu, MenuItem } from '@material-ui/core';
import { observer } from 'mobx-react';
import { range } from 'lodash';
import { PyramidNetWidgetModel } from '../../../../../../../models/PyramidNetMakerStore';
import { TOUR_ELEMENT_CLASSES } from '../../../../../../../../../common/util/tour';
import { useWorkspaceMst } from '../../../../../../../../../WidgetWorkspace/models/WorkspaceModel';

export const SnapMenu = observer(() => {
  // when truthy, snap menu is open
  const [positionSnapMenuAnchorEl, setPositionSnapMenuAnchorEl] = useState(null);

  const workspaceStore = useWorkspaceMst();
  const widgetModel:PyramidNetWidgetModel = workspaceStore.selectedStore;
  const { textureEditor } = widgetModel;

  const {
    faceDecoration, decorationBoundary,
    selectedTextureNodeIndex, showNodes,
  } = textureEditor;

  if (!faceDecoration || !decorationBoundary) {
    return null;
  }

  const numFaceSides = decorationBoundary.vertices.length;

  const handleCornerSnapMenuClick = (event) => {
    setPositionSnapMenuAnchorEl(event.currentTarget);
  };

  const resetPositionSnapMenuAnchorEl = () => { setPositionSnapMenuAnchorEl(null); };

  const fitTextureToFaceSnapMenuOnclick = () => {
    textureEditor.refitTextureToFace();
    resetPositionSnapMenuAnchorEl();
  };

  const textureOriginToFaceCenterSnapMenuOnclick = () => {
    textureEditor.repositionTextureWithOriginOverFaceCenter();
    resetPositionSnapMenuAnchorEl();
  };

  const textureOriginToCornerSnapMenuOnclick = (index) => {
    if (index !== undefined) {
      textureEditor.repositionTextureWithOriginOverCorner(index);
    }
    resetPositionSnapMenuAnchorEl();
  };

  const originToFaceCenterSnapMenuOnclick = () => {
    textureEditor.repositionOriginOverFaceCenter();
    resetPositionSnapMenuAnchorEl();
  };

  const originToTextureCenterSnapMenuOnclick = () => {
    textureEditor.repositionOriginOverTextureCenter();
    resetPositionSnapMenuAnchorEl();
  };

  const originToCornerSnapMenuOnclick = (index) => {
    if (index !== undefined) {
      textureEditor.repositionOriginOverCorner(index);
    }
    resetPositionSnapMenuAnchorEl();
  };

  const selectedNodeToCornerSnapMenuOnclick = (index) => {
    if (index !== undefined) {
      textureEditor.repositionSelectedNodeOverCorner(index);
    }
    resetPositionSnapMenuAnchorEl();
  };

  const selectedNodeToFaceCenterSnapMenuOnclick = () => {
    textureEditor.repositionSelectedNodeOverFaceCenter();
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

        {showNodes && selectedTextureNodeIndex !== null
          && [
            (
              <MenuItem
                onClick={() => {
                  selectedNodeToFaceCenterSnapMenuOnclick();
                }}
              >
                Selected node to face center
              </MenuItem>
            ),
            ...range(numFaceSides).map((index) => (
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
            )),
          ]}
      </Menu>
    </>
  );
});
