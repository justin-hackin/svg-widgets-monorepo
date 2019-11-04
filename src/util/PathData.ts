import cloneDeep from 'lodash-es/cloneDeep';
import includes from 'lodash-es/includes';
import intersection from 'lodash-es/intersection';
// @ts-ignore
import { Matrix, Point } from '@flatten-js/core';
import isNaN from 'lodash-es/isNaN';
import {
  composeSVG, parseSVG,
} from 'svg-path-parser';
import { PointTuple, Coord } from './geom';

const castToArray = (pt: Coord):PointTuple => {
  if (pt instanceof Point) {
    // @ts-ignore
    const arrPt:PointTuple = [pt.x, pt.y];
    // @ts-ignore
    if (isNaN(pt.x) || isNaN(pt.y)) {
      throw new Error(`point co-ordinates contain NaN: (${arrPt})`);
    }
    return arrPt;
  }
  // @ts-ignore
  return pt;
};


export const COMMAND_FACTORY = {
  M: (to:Coord):Command => ({
    code: 'M',
    to: castToArray(to),
  }),
  L: (to:Coord):Command => ({
    code: 'L',
    to: castToArray(to),
  }),
  C: (ctrl1:Coord, ctrl2:Coord, to:Coord):Command => ({
    code: 'C',
    to: castToArray(to),
    ctrl1: castToArray(ctrl1),
    ctrl2: castToArray(ctrl2),
  }),
  S: (ctrl2, to):Command => ({
    code: 'S',
    to: castToArray(to),
    ctrl2: castToArray(ctrl2),
  }),
  Q: (ctrl1:Coord, to:Coord):Command => ({
    code: 'Q',
    to: castToArray(to),
    ctrl1: castToArray(ctrl1),
  }),
  T: (to:Coord):Command => ({
    code: 'T',
    to: castToArray(to),
  }),
  A: (radiusX, radiusY, sweepFlag, largeArcFlag, xAxisRotation, to):Command => ({
    code: 'A',
    radius: [radiusX, radiusY],
    flags: [sweepFlag, largeArcFlag],
    to: castToArray(to),
    xAxisRotation,

  }),
  Z: ():Command => ({
    code: 'Z',
  }),
};

interface Command {
  code: string,
  to?: PointTuple,
  ctrl1?: PointTuple,
  ctrl2?: PointTuple,
  radius?: PointTuple,
  flags?: [boolean, boolean],
  xAxisRotation?: number,
  value?: number,
}

const UNTRANSFORMABLE_COMMANDS = ['A', 'V', 'H'];
const TRANSFORMABLE_COMMAND_PROPS = ['to', 'ctrl1', 'ctrl2'];

export class PathData {
  commands: Command[];

  constructor(param?: Command[] | Coord) {
    // TODO: check instance type
    if (!param) {
      this.commands = [];
      return this;
    }
    // @ts-ignore
    this.commands = param instanceof Point ? [COMMAND_FACTORY.M(param)] : param;
    return this;
  }

  static fromDValue(d):PathData {
    return new PathData(parseSVG(d));
  }

  move(to):PathData {
    const command = COMMAND_FACTORY.M(to);
    this.commands.push(command);
    return this;
  }

  line(to):PathData {
    const command = COMMAND_FACTORY.L(to);
    this.commands.push(command);
    return this;
  }

  close():PathData {
    const command = COMMAND_FACTORY.Z();
    this.commands.push(command);
    return this;
  }

  cubicBezier(ctrl1, ctrl2, to):PathData {
    const command = COMMAND_FACTORY.C(ctrl1, ctrl2, to);
    this.commands.push(command);
    return this;
  }

  quadraticBezier(ctrl1, to):PathData {
    const command = COMMAND_FACTORY.Q(ctrl1, to);
    this.commands.push(command);
    return this;
  }

  smoothQuadraticBezier(to):PathData {
    const command = COMMAND_FACTORY.T(to);
    this.commands.push(command);
    return this;
  }

  elipticalArc(to, radiusX, radiusY, sweepFlag, largeArcFlag, xAxisRotation):PathData {
    const command = COMMAND_FACTORY.A(radiusX, radiusY, sweepFlag, largeArcFlag, xAxisRotation, to);
    this.commands.push(command);
    return this;
  }

  concatCommands(commands):PathData {
    this.commands = this.commands.concat(cloneDeep(commands));
    return this;
  }

  concatPath(path):PathData {
    this.commands = this.commands.concat(cloneDeep(path.commands));
    return this;
  }

  // this could lead to the rendering of invalid svg
  // meant to be used in conjunction with concatPath to fuse paths that start and end at same the point
  sliceCommandsDangerously(...params):PathData {
    this.commands = this.commands.slice(...params);
    return this;
  }

  transformPoints(matrix:Matrix) {
    this.commands.forEach((command) => {
      if (includes(UNTRANSFORMABLE_COMMANDS, command.code.toUpperCase())) {
        throw new Error('can not apply matrix transformation to arc');
      }
      const propsToTransform = intersection(Object.keys(command), TRANSFORMABLE_COMMAND_PROPS);
      propsToTransform.forEach((prop) => {
        // eslint-disable-next-line no-param-reassign
        command[prop] = matrix.transform(command[prop]);
      });
    });
  }

  getD():string {
    return composeSVG(this.commands);
  }
}
