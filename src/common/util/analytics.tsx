import { Step } from 'react-joyride';
import React from 'react';

/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/quotes */

export enum ANALYTICS_BUFFERED_EVENTS {
  DRAG_TRANSLATE = 'drag-translate',
  DRAG_TRANSLATE_AXIS = 'drag-translate-axis',
  DRAG_ROTATE = 'drag-rotate',
  DRAG_SCALE_TEXTURE = 'drag-scale-texture',
  DRAG_SCALE_VIEW = 'drag-scale-view',
  DRAG_ORIGIN = 'drag-origin',
  SCROLL_ROTATE = 'scroll-rotate',
  SCROLL_SCALE_TEXTURE = 'scroll-scale-texture',
  SCROLL_SCALE_VIEW = 'scroll-scale-view',
}

export enum TOUR_ELEMENT_CLASSES {
  SHAPE_SELECT = 'shape-select--tour',
  ROTATE_3D = 'rotate-3d--tour',
  UPLOAD_IMAGE = 'upload-image--tour',
  HISTORY_BUTTONS = 'history-buttons--tour',
  DOWNLOAD_3D = 'download-3d--tour',
  IS_BORDERED = 'is-bordered--tour',
  DRAG_MODE_INDICATOR = 'drag-mode-indicator--tour',
  OPEN_TEXTURE_ARRANGEMENT = 'open-texture-arrangement--tour',
  SAVE_TEXTURE_ARRANGEMENT = 'save-texture-arrangement--tour',
  SNAP_MENU = 'snap-menu--tour',
  NODE_INPUTS = 'node-inputs--tour',
  FILL_IS_POSITIVE = 'fill-is-positive--tour',
  USE_ALPHA_TEXTURE = 'use-alpha-texture--tour',
  ROTATE_INPUT = 'rotate-input--tour',
  TEXTURE_ARRANGEMENT_AREA = 'texture-arrangement-area--tour',
}

export const TOUR_STEPS: Step[] = [
  {
    target: `.${TOUR_ELEMENT_CLASSES.UPLOAD_IMAGE}`,
    content: `To get started, click here to upload a bitmap or vector graphic image to the texture arrangement area. 
    Supported file types: .png, .jpg, .svg.  Click "Next" and this wizard will add a sample svg path.`,
    disableBeacon: true,
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.DRAG_MODE_INDICATOR}`,
    content: (
      <div>
        <p>
          This indicator tells you how dragging (and optionally scrolling) will affect the texture or view. You can
          change the drag mode by holding down different modifiers. Hover on the options to see their functions and the
          key combos that activate them.
        </p>
        Using scroll with modifiers may not be available in your browser so the use of dragging is recommended. However,
        scrolling can have ergonomic benefits and there are workarounds to the browser default behaviours. You can
        disable ctrl+scroll in Chrome with
        {' '}
        <a
          href="https://chrome.google.com/webstore/detail/disable-ctrl-%20-scroll-whe/mdpfkohgfpidohkakdbpmnngaocglmhl"
        >
          this extension
        </a>
        or with
        {' '}
        <a href="https://duntuk.com/disable-scroll-wheel-zoom-firefox">a setting in Firefox</a>
        . A must for KDE Linux users: disable alt+drag window move feature (see
        {' '}
        <a
          href="https://superuser.com/questions/584730/how-can-i-disable-alt-mouse-default-behavior-in-kde"
        >
          this question
        </a>
        {' '}
        for tips).
      </div>
    ),
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.NODE_INPUTS}`,
    content: 'You can use the geometry of your svg file to align a particular path node to any of the triangle corners. Flip the switch and adjust the node size if necessary. Then click on any of the dots to select it. Finally open up the...',
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.IS_BORDERED}`,
    content: 'When you have an image on the arrangement area, you can make the image go all the way to the edges of the shape. In a physical construction of the shape the black border serves to disguise the shadow that is formed by the underlap of tab material along one or more edges.',
  },
  {
    target: `${TOUR_ELEMENT_CLASSES.TEXTURE_ARRANGEMENT_AREA}`,
    content: 'The drag/scroll mode is active in this region.  Notice you don\'t need to click down on the image or path fill in order to change the position/rotation/scale. Except for in translation mode, only the up-down motion of dragging changes the mode property. The red circle represents the "transform origin" about which scale and rotation of the image happens; it can be repositioned by dragging.',
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.HISTORY_BUTTONS}`,
    content: 'Getting textures in just the right spot can be tricky so these undo/redo buttons will offer you some forgiveness in your tinkering.',
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.DOWNLOAD_3D}`,
    content: (
      <>
        Like what you see? This button will let you download the 3D model in .glb format.
        Not sure what to do with a .glb file? Why not drag and drop it into a virtual meeting room on
        {' '}
        <a target="_blank" href="http://hubs.mozilla.com" rel="noreferrer">http://hubs.mozilla.com</a>
        {' '}
        and invite your friends to come see your creations.
      </>
    ),
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.SAVE_TEXTURE_ARRANGEMENT}`,
    content: 'You can save the image data with its arrangement on the shape with this button. The file you save can then be imported into the Polyhedral Net Studio desktop application which can construct a cutable/printable/buildable svg design. If you want to delegate the production of the design you\'ve created, this file will be your ticket.',
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.OPEN_TEXTURE_ARRANGEMENT}`,
    content: 'If you made a mistake you can open your file again here and re-save.',
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.SNAP_MENU}`,
    content: 'snap menu. Now you can choose one of the "Selected node to corner" options in the menu.  You can also move the image so the origin is positioned over one of the corners or you can snap the origin alone to any corner.',
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.FILL_IS_POSITIVE}`,
    content: `This switch will change how the fill of a path is represented on the model. When the switch is off 
    the fill of the path represents the holes that will be cut out of the material. When it is on, the fill of the path represents the material left behind. Depending on your path and its arrangement, you may have a texture arrangement which is physically impossible to make. To prevent this, take a close look at the 3D preview with alpha texture enabled and see if you notice any floating material or protuberances which might get caught and bent out of shape.`,
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.USE_ALPHA_TEXTURE}`,
    content: 'The alpha texture is more aesthetically pleasing but it requires more computer resources so you can use this kill switch to improve performance on older computers.',
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.ROTATE_INPUT}`,
    content: `This displays and modifies the rotation of the texture. Although rotation can be done with drag/scroll
    operations, this input is useful for aligning textures containing rotational symmetry.`,
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.SHAPE_SELECT}`,
    content: 'Want to see the same texture on a different shape? You can change this shape here.',
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.ROTATE_3D}`,
    content: 'This will let you enjoy a hypnotizing twirl, allowing you to see the shape from different angles. Enjoy!',
  },
];
