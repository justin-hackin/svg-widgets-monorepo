import React from 'react';
import { Step } from 'react-joyride';
import { DimensionsModel } from '../../renderer/widgets/PyramidNet/models/DimensionsModel';
import { theme } from '../style/style';
import { SAMPLE_TEXTURES } from './sample-textures';

/* eslint-disable react/no-unescaped-entities */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/quotes */

export enum TOUR_ELEMENT_CLASSES {
  SHAPE_SELECT = 'shape-select--tour',
  ROTATE_3D = 'rotate-3d--tour',
  UPLOAD_IMAGE = 'upload-image--tour',
  HISTORY_BUTTONS = 'history-buttons--tour',
  IS_BORDERED = 'is-bordered--tour',
  DRAG_MODE_INDICATOR = 'drag-mode-indicator--tour',
  TEXTURE_EDITOR_FILE_MENU = 'texture-editor-file--tour',
  SNAP_MENU = 'snap-menu--tour',
  NODE_INPUTS = 'node-inputs--tour',
  FILL_IS_POSITIVE = 'fill-is-positive--tour',
  USE_ALPHA_TEXTURE = 'use-alpha-texture--tour',
  ROTATE_INPUT = 'rotate-input--tour',
  FULL_SCREEN_BUTTON = 'full-screen-button--tour',
  TEXTURE_ARRANGEMENT_AREA = 'texture-arrangement-area--tour',
  SHAPE_PREVIEW_AREA = 'shape-preview-area',
}

export interface MyStep extends Step {
  nextAction?: number
}

export enum STEP_ACTIONS {
  ADD_PATH_TEXTURE,
  ADD_IMAGE_TEXTURE,
}

// TODO: consider custom component for tour using Material UI Popper

// TODO: use MUI global style (scoped to tour elements) instead of linkStyle
const linkStyle = { color: theme.palette.primary.main };
export const TOUR_STEPS: MyStep[] = [
  {
    target: 'body',
    title: 'Welcome to Polyhedral Decoration Studio!',
    content: (
      <>
        <p>
          This app allows you to decorate the faces of various polyhedra with either bitmap images or svg vector graphics. It is a tool that was developed to facilitate the creation of polyhedral lanterns as shared by Playful Geometer.
        </p>
        <p>
          Polyhedral Decoration Studio is one part of a 2-part desktop application called Polyhedral Net Studio.  The other part of the desktop application, the dieline editor, generates a cutout pattern than can be folded into pyramids which interconnect to form the shapes you see.  Within the desktop app, this tool applies an image or a cropped svg path to the faces of the pyramid net (a net is a flat cutout that can be folded into a 3D shape).
        </p>
      </>
    ),
    placement: 'center',
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.UPLOAD_IMAGE}`,
    content: `To get started, click here to upload a bitmap or vector graphic image to the texture arrangement area. 
    Supported file types: .png, .jpg, .svg. Keep in mind, when uploading SVG files, this application only reads path elements and imports only the topmost path. Be sure to convert/merge all required content into a single path and send it to the top of the document. Click "Next" and this wizard will add a sample svg path.`,
    nextAction: STEP_ACTIONS.ADD_PATH_TEXTURE,
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.TEXTURE_ARRANGEMENT_AREA}`,
    content: (
      <>
        <p>
          Your image shows up here, superimposed upon the shape face triangle. The sample SVG path applied here is a member of a downloadable collection of
          {' '}
          <a style={linkStyle} target="_blank" href="https://github.com/justin-hackin/stroke-filled-regular-tilings" rel="noreferrer">Stroke-Filled Regular Tilings</a>
          {' '}
          that you can use to get started with polyhedral decoration.
        </p>
        <p>
          Notice how dragging anywhere in the area moves the pattern (not just dragging within the path fill or bounding box).
        </p>
      </>
    ),
    placement: 'right',
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.SHAPE_PREVIEW_AREA}`,
    content: 'and here you can see the path as shadow-casting faces of a lantern made with this cut pattern. You can drag here to rotate it or scroll to zoom in/out.',
    placement: 'left',
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.DRAG_MODE_INDICATOR}`,
    placement: 'right',
    content: (
      <div>
        <p>
          This indicator tells you how dragging the image (and optionally scrolling) will affect the texture or view.
          You can
          change the drag mode by holding down different modifiers. Hover on the options to see their functions and the
          key combos that activate them.
        </p>
        <p>
          Using scroll with modifiers may not be available in your browser so the use of dragging is recommended.
          However,
          scrolling can have ergonomic benefits and there are workarounds to the browser default behaviours. You can
          disable ctrl+scroll in Chrome with
          {' '}
          <a
            style={linkStyle}
            href="https://chrome.google.com/webstore/detail/disable-ctrl-%20-scroll-whe/mdpfkohgfpidohkakdbpmnngaocglmhl"
          >
            this extension
          </a>
          {' '}
          or with
          {' '}
          <a style={linkStyle} href="https://duntuk.com/disable-scroll-wheel-zoom-firefox">a setting in Firefox</a>
          .
        </p>
        <p>
          A must for KDE Linux users: disable alt+drag window move feature (see
          {' '}
          <a
            style={linkStyle}
            href="https://superuser.com/questions/584730/how-can-i-disable-alt-mouse-default-behavior-in-kde"
          >
            this question
          </a>
          {' '}
          for tips).
        </p>
      </div>
    ),
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.TEXTURE_ARRANGEMENT_AREA}`,
    content: 'The drag/scroll mode is active in this region.  Notice you don\'t need to click down on the image or path fill in order to change the position/rotation/scale. Except for in translation modes, only the up-down motion of dragging changes the mode property. The red circle represents the "transform origin" about which scale and rotation of the image happens. It can be dragged in order to reposition.',
    placement: 'right',
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.NODE_INPUTS}`,
    content: 'You can use the geometry of your svg file to align a particular path node to any of the triangle corners. Flip the switch and adjust the node size if the nodes are too small or are overlapping. To select a node, click on any of the node markers in the texture arrangement area and proceed to...',
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.SNAP_MENU}`,
    content: `...the snap menu, which you can click to open. Now you can choose one of the "Selected node to corner" options therein. Node selection is for snapping alone so once you're done it's best to turn it off to improve performance. With this menu, you can also move the image so the origin is positioned over one of the corners or you can snap the origin alone to any corner. Feel free to give it a try.`,
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.HISTORY_BUTTONS}`,
    content: 'Getting textures in just the right spot can be tricky so these undo/redo buttons will offer you some forgiveness in your tinkering.',
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.TEXTURE_EDITOR_FILE_MENU}`,
    content: (
      <>
        <p>
          This menu lets you save and reopen the image data along with its arrangement on the shape as a .pnst file (pyramid net specification texture). The file you save can then be imported into the Polyhedral Net Studio desktop application. It can construct a cutable/printable/buildable svg design from your arrangement. If you want to delegate the production of the design you've created, this file will be your ticket.
        </p>
        <p>
          This menu also allows you to download a 3D model of the sape in .glb format.
          Not sure what to do with a .glb file? Why not drag and drop it into a virtual meeting room on
          {' '}
          <a style={linkStyle} target="_blank" href="http://hubs.mozilla.com" rel="noreferrer">http://hubs.mozilla.com</a>
          {' '}
          and invite your friends to come see your creation.
        </p>
      </>
    ),
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.FILL_IS_POSITIVE}`,
    content: `This switch will change how the fill of a path is represented on the model. When the switch is off 
    the fill of the path represents the holes that will be cut out of the material. When it is on, the fill of the path represents the material left behind. Depending on your path and its arrangement, you may have a texture arrangement which is physically impossible to make. To prevent this, take a close look at the 3D preview with alpha texture enabled and see if you notice any floating material or protuberances which might get caught and bent out of shape.`,
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.ROTATE_INPUT}`,
    content: `This displays and modifies the rotation of the texture. Although rotation can be done with drag/scroll
    operations, this input is useful for aligning textures containing rotational symmetry.`,
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.USE_ALPHA_TEXTURE}`,
    content: (
      <>
        <p>
          The alpha texture lets you see through the cut holes in the shape preview pane. This feature requires more computer resources so you can turn it off in order to improve performance on older computers. This feature is only present with svg path textures.
        </p>
        <p>
          There is one input that is only present with an image texture,  Click "Next" to apply an image texture.
        </p>
      </>
    ),
    nextAction: STEP_ACTIONS.ADD_IMAGE_TEXTURE,
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.IS_BORDERED}`,
    content: 'Now we have a new switch. Flipping this switch off will make the image go all the way to the edges of the shape. In a physical construction of the shape the black border serves to disguise the shadow that is formed by the underlap of tab material along one or more edges. Some users might find the borderless version more attractive for 3D export.',
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.SHAPE_SELECT}`,
    content: 'Want to see the same texture on a different shape? You can change this shape here.',
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.ROTATE_3D}`,
    content: 'This will let you enjoy a hypnotizing twirl, allowing you to see the shape from different angles.',
  },
  {
    target: `.${TOUR_ELEMENT_CLASSES.FULL_SCREEN_BUTTON}`,
    content: `Here you can make the shape preview full-screen for your aesthetic enjoyment.`,
  },
  {
    target: 'body',
    placement: 'center',
    title: 'All done',
    styles: {
      options: { width: 720 },
    },
    content: (
      <>
        <p>
          This concludes your tour of Polyhedral Decoration Studio. The sample texture will be cleared upon exit.
        </p>
        <p>
          This app is a work-in-progress so your feedback would be greatly appreciated. You can report bugs and make feature suggestions by emailing
          {' '}
          <a style={linkStyle} href="mailto:playful.geometer@protonmail.com">Playful Geometer</a>
          .
        </p>
        <p>
          If you would also like to try building a sample model from pyramid net dielines, you can take a look at
          {' '}
          <a
            style={linkStyle}
            href="https://www.hylo.com/groups/stellar-coinciders/post/37875"
          >
            this post
          </a>
          . If you want to help create more cultural artifacts like this, get your hands on the desktop application, and co-create a participatory design community, please reach out in order to join the alpha test group. Playful Geometer is exploring the possibility of assembling a team of artists, product/graphic designers, coders, crafters, gifters and community animators. Only with engagement can this dream come alive.
        </p>
        <p>
          If you are interested in using exported 3D models for commercial purposes, please obtain permission by email before doing so.
        </p>
        <p>
          Disclosure: this app anonymously logs the frequency of drag, scroll, and image upload, and shape change operations but all image data and file names remain private. Logged data will be used to improve the user experience of this app. Disabling any ad blockers you may have on this site will allow you to contribute to the enhancement of this app.
        </p>
        <p />
        <p>
          Should you need to revisit this tour, you can do so by pressing ❔ button in the toolbar. Enjoy!
        </p>
      </>
    ),
  },
];

export const SAMPLE_PATH_SNAPSHOT = {
  isPositive: true,
  sourceFileName: 'sample_svg',
  pathD: SAMPLE_TEXTURES.pathD,
};

export const SAMPLE_IMAGE_SNAPSHOT = {
  sourceFileName: 'sample_jpg',
  dimensions: new DimensionsModel({ width: 1028, height: 685 }),
  imageData: SAMPLE_TEXTURES.imageData,
};
