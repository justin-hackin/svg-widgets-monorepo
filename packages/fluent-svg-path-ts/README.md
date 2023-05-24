# fluent-svg-path-data-ts

A [fluent interface](https://en.wikipedia.org/wiki/Fluent_interface) for the SVG `<path>` d-attribute.

This library is a thin wrapper on [svg-path-commander](https://github.com/thednp/svg-path-commander) that allows you to construct and manipulate a new or parsed SVG path. It only supports a limited subset of SVG path commands. 

The following restrictions on PathData exist:
- no relative (lower-cased) commands allowed
- no H or V commands allowed (converted to L in parsing)
- first command must be M
- an arc function is exposed but under the hood, the arc is converted into one or more cubic beziers

Why all the restrictions? Manipulating/transforming path geometry can be difficult when there is a lot of (potentially recursive) inference taking place. For example, in order to calculate the tangent of a path one might need to iterate all the way to the start of the path if there are a series of smooth bezier commands or relative commands. Arcs prove difficult to transform via matrix if the scaling is non-uniform. 

In order to provide additional safety to the data structure, the commands are made immutable with [immer](https://immerjs.github.io/) and exposed as a readonly property `commands`.

Sample usage:

```javascript

const dValue = (new PathData('M0,0'))
    .line({ x: 10, y: 10 })
    .cubicBezier([12, 17], [24, 56], { x: 100, y: 100 })
    .transformByObject({
        // from svg-path-commander specification
        translate: 15, // X axis translation
        rotate: 15, // Z axis rotation
        scale: 0.75, // uniform scale on X, Y, Z axis
        skew: 15, // skew 15deg on the X axis
        // if not specified, will default to [0,0] unlike with svg-path-commander specification, based on viewbox
        origin: [15, 0],
    })
    .quadraticBezier([124, 172], { x: 100, y: 100 })
    .move([0, 0])
    .ellipticalArc(100, 100, 45, true, false, [44, 44])
    .transformByMatrix((new DOMMatrixReadOnly()).scale(100).rotate(180))
    .getD();
```

Notice how coordinates can be specified by both objects and arrays. You are free to use any object with `x` and `y` properties and the primitive values will be extracted out (no references held) but arrays must be of length 2. This allows for the use of geometry libraries without the annoyance of doing a lot of casting, at least on the way in. Internally, coordinates are storied as POJOs.

If you want to break out of the guardrails of the fluent interface, you are free to use the command factories in an array as such

```javascript
const dValue = commandArrayToPathD([
    CommandFactory.M([0, 0]),
    CommandFactory.L({ x: 1, y: 1})
]);
```

⚠️ **WARNING**: this is an alpha release with no testing. Some mostly uncommented documentation available [here](https://justin-hackin.github.io/svg-widgets-monorepo/).
