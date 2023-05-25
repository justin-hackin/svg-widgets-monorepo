# SVG Widgets Monorepo

A monorepo of SVG scripting libraries. It contains the following packages:
* [widgets](packages/widgets/README.md): formerly Polyhedz Studio, the root web app serving SVG widgets at [https://polyhedz-studio.vercel.app]. (https://polyhedz-studio.vercel.app)
* [fluent-svg-path-ts](packages/fluent-svg-path-ts/README.md): library (unpublished) for manipulating SVG path data
* `eslint-config-custom`: TS eslint config extended from airbnb-base + airbnb-typescript (no React)

This repo is under heavy refactoring. The UI/state code for creating widgets will be extracted into a separate library `svg-widget-studio` of which the particular widgets created will depend on.
