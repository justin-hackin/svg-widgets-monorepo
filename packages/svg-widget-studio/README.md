# SVG Widget Studio
_A toolkit for the creation of parameterized 2D design objects._

## Overview
This library is intended to support the creation of design objects through coding with a mind towards:
- well-organized data structures
- persistence and iteration of design parameters
- developing multi-part 2D designs
- rich extensibility of user interface
- ease of distribution through online code-sharing platforms

This project depends upon React, Material UI (MUI), and mobx-keystone.

React is used to render the 2 sections of the widget workspace UI
* design area: the section that shows the SVG assets
* control panel: a series of inputs that adjust the design.

MK is used to create “tweakable” data structures that are registered as widgets. The MK models contain custom tweakable property types which express the data type as well as the input elements that control the value as seen in the control panel e.g. a boolean property controlled by a switch, a number in the range [0, 1] starting at 0.5.

Developers can create MK models and organize the information into nested trees of information. Internally, the control panel will render all of its top-level tweakable properties of the model using the rich set of UI tools in MUI. There are escape hatches to give the developer more fine-grained control of the control panel content.

The output of each widget is one or more design assets. Each design asset renders to a separate SVG file. Design assets specify the bounds of the asset (to serve as the viewBox of the SVG), the number of copies needed to produce each widget, and a component that renders the SVG based upon the data structure.

Widgets are registered by applying a customized @widgetModel decorator that serves as an alternative to the @model decorator of MK. When there are multiple widgets registered, the initial screen and new file action will offer a choice of the widget to create. Otherwise, the widget will immediately be shown with its defaults and reset upon new file action.

Once you have registered your widgets, you need to render the WidgetWorkspace inside of the WidgetWorkspaceProvider. You can force the orientation of the panels (which removes the orientation selector from the design area toolbar) as well as set the max/min/default value. Note that the position of the split is persisted across reloads.

If you want to develop a different layout for the WidgetWorkspace, you can instead render the WidgetDesignArea and WidgetControlPanel in your own layout instead of the adjustable split-screen view. This can help you to create your own rich UI elements that can modify your widget parameters in more complicated ways or present alternative views of the design (e.g. 3D models).

## Asset types

Assets are the parts of your design. Each asset has a number of copies associated with it. There are different configurations in which to configure your design:
- **Solitary Asset Definition**:  there is only one SVG for the widget
- **Disjunct Asset Definition**: one SVG file per asset is exported, each asset can be viewed independently or simultaneously. The number of copies is unique across assets.
-  **Registered Asset Definition**: all assets are contained in a single SVG file, where each asset is a separate layer in Inkscape. The visibility of each asset can be adjusted independently. Developed with the possibility of print-and-cut designs in mind.

## Rationalle

As a developer, I have a long history of writing computer scripts to generate vector graphics. In the beginning, I used Python to generate geometric SVG patterns. The scripts needed to be edited and re-ran every time I adjusted any parameters. Later, I learned to create Inkscape plugins  which enabled a UI which allowed the user to see the design change in real-time. Unfortunately, it wasn’t very easy to bundle and distribute them and I doubt my fledgling work reached many. Now the library is long-defunct because of the dependency on a long-expired XML library.

Later on, I used PaperJS to create JS scripts that could be shared online much easier. This is where the Cylinder Lightbox widget first was hatched. I never attempted to create a UI for the variables because it was a lot of manual labour that seemed unwarranted.

This is a similar problem to what I encountered when developing Inkscape plugins: there was a lot of manual work involved in creating an .inx file that wires up the script to the interface. In this project, I sought to enable the designer to focus solely on creating a model that would express the parameterized design without having to develop a UI.

In more recent years, I challenged myself to encapsulate the complexity of the tab system I had evolved over many years of experimenting with polyhedral model creation. Previously, I had done all of the designs in Inkscape, without scripting, making it quite timely to modify the design in order to maximize their integrity. This library is the guts of the system I developed to enable this and now the design-specific [widgets](/packages/widgets/README.md).


## Roadmap/Ideas

- Migrations: since widgets are code, they are subject to change, meaning the exported `.widget` file might become unreadable when properties are added, removed, and reorganized. A migration scheme would allow these older versions of a widget spec file to be automatically upgraded. [version-json](https://www.npmjs.com/package/version-json) is a good utility for this.
- UI props hierarchy: `<TweakableChildrenInputs >` crawls tree recursively, with option to display a collapsing tree of inputs or specify wrapper component(s) for each level
