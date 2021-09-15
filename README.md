# Polyhedral Net Studio 



A desktop application for the fabrication of interlocking pyramid nets which form stellations and other geometric polyhedra. Flat panels become pyramids and pyramid collections are connected to become spherical star-like shapes. These shapes have been produced under the banner of [Playful Geometer](https://www.facebook.com/playful.geometer). The creation of Polyhedral Net Studio represents the (potential) fulfillment of a wish to share this art/craft with other makers. In the past, the dielines (cut/score vector paths) for these shapes were manually created with Inkscape. Modifying the tab system  was a tedious task that made design iteration difficult. With Polyhedral Net Studio, cutout paths are generated based on algorithms in which every parameter is tweakable. 

<img src="" alt="" width="320"/>



| ![polyhedral lantern sculpture with print face decoration](/static/images/widgets/polyhedral-net.jpg) | ![polyhedral lantern sculpture with cut holes face decoration](/static/images/widgets/polyhedral-net-vector.jpg) |
| ------------------------------------------------------------ | ------------------------------------------------------------ |


## App info

This app consists of 2 main views:

### Dieline Editor

| ![Dieline Editor with vector graphics](/docs/images/dieline_editor_vector.png) | ![Dieline Editor with raster graphics](/docs/images/dieline_editor_raster.png) |
| ------------------------------------------------------------ | ------------------------------------------------------------ |


Allows viewing of the SVG dielines and optional print layer with controls for adjusting every aspect of the design. Each pyramid net consists of several component parts

- **Ascendant edge**: these are the tabs that connect 2 disjunct faces together, allowing it to become a pyramid
- **Base edge**: these are the tabs that allow the pyramids to interlock into a spherical configuration
- **Face decoration**: an optional print or cut pattern applied to the shape's faces

#### Features

- Modify all parameters that compose the dielines with reasonable slider value ranges
- Break outside the suggested slider range with with text input toggle, enabling precision adjustment and non-standard settings exploration (use with caution)
- Choose your preferred unit of display/input in settings, measurement data is saved in unit-agnostic pixels (96dpi)
- Supports fractional display/input of inches or cm
- Customized cut and score stroke properties
- User settings persisted across sessions
- Save the dielines as SVG alongside a .pns file that will allow you to re-open your parameter settings later
- Image-based textures are exported as separate Inkscape-compatible layer so you can print and cut with the same document
- Image registration modes
    - Laser cutter: cut registration marks onto the laser cutter bed, trim print to expose its registration corners, and line up the print with the bed
    - Craft Robo: export a bounding box in dielines for use with Craft Robo Pro Illustrator plugin
- Test tabs' connections efficiently without having to cut out a whole pyramid
- Break a single pyramid net up into multiple sections (nets per pyramid), allowing maximum shape size with limited cutting area
- View test tabs via multi-widget interface
- .pns file can also be opened in the test tabs widget
- Download/import SVG template for editing cut paths with your own vector editor of choice as an alternative to texture editor
- Optional path scoring: adjust the dasharray pattern ratios independent of length of the pattern repetition and offset. Instead of simply styling a solid path to look like dashes, this feature makes a series of `<path>` lines that can be sent directly to a laser cutter

### Texture Editor

| ![Texture Editor with vector graphics](/docs/images/texture_editor_vector.png) | ![Texture Editor with raster graphics](/docs/images/texture_editor_raster.png) |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
|                                                              |                                                              |

Interactively apply cut patterns or print textures to the faces of your shape and see a 3D preview of the resultant shape

#### Features
- Path textures (imports only topmost `<path>` of selected SVG file)
- Use path fill as holes (negative) or material (positive)
- Path automatically clipped to dieline faces, insetting the pattern to prevent appearance of ascendant edge flap
- Flexible texture arrangement interface: adjust scale, rotation, zoom with modifier keys + mouse wheel OR vertical drag
- Lock dragging horizontally or vertically
- Snap texture + origin
- Snap origin/nodes to face corners/center
- Image textures
- Optional black border obscures shadows casted by ascendant edge tabs
- Shape preview border width syncs with ascendant edge tabs thickness
- Export GLB files of 3D preview (compatible with Mozilla Hubs)
- Intelligent defaults for all files names (encodes shape name and texture file name)


### Bonus

<img src="/static/images/widgets/cylinder-lightbox.jpg" alt="polyhedral lantern sculpture" width="320"/>

Another "widget" called Cylinder Lightbox allows one to efficiently construct a cylinder out of flat panels. You can access it using the gear icon in the bottom left corner. It has been used to create circular LED lightboxes. It was included in order to hint at the possibility of extension.

Because this project contains abstractions that make it easy to build "tweakable" data structures, the creation of a plugin-based architecture which will separate the widgets from the workspace is being explored.

## Warning

This is an alpha stage project with some known bugs and lacking features as listed in the [project board](https://github.com/justin-hackin/polyhedral-net-studio/projects/1).

KDE users will experience issues with Alt-dragging modifiers in Texture Editor due to the window manager's default behaviour, see [this post](https://superuser.com/questions/584730/how-can-i-disable-alt-mouse-default-behavior-in-kde) for a fix.

## Developer notes

This Electron app is built with webpack-electron. To start its dev server, do:
```
npm run dev
```

or to run the production version of the app do:

```
npm run compile && npm run start
```

After cutting a new npm tag and compiling, the app is deployed to github releases with 
```
npm run release
```

You will not be able to complete this operation unless you have set up GH_TOKEN environment variable.

### Texture editor web port

In the interests of attracting graphic designers and artists to use the texture editing feature without the overhead of downloading the app, the texture editor is also deployed as a [stand-alone web application](https://polyhedral-net-factory-bahby.ondigitalocean.app/). Users can then save the texture arrangement and have a fabricator apply the pattern to the dielines in the desktop app. Splitting the build into an Electron version and a web version using npm workspaces or learna proved to be difficult so a web-based webpack build has been nested inside this project.

To host the web texture editor on a development server do:

```
npm run web-start-dev
```

or to run the production code on a local server do

```
npm run web-start-prod
```

Pushing code to the branch `web-deploy` will cause DigitalOcean App Platform to fetch the code from the branch and re-deploy. This should only be done from the master branch.

