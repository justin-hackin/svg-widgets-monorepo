import {
  cloneDeep, isNaN,
} from 'lodash';
// @ts-ignore
import { Point } from '@flatten-js/core';
import {
  composeSVG, parseSVG,
} from 'svg-path-parser';
import svgpath from 'svgpath';

import { PointTuple, Coord } from '../../common/util/geom';
import { addTuple } from '../../common/util/2d-transform';

/* eslint-disable no-param-reassign */

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
  A: (
    radiusX: number, radiusY: number, sweepFlag: boolean, largeArcFlag: boolean, xAxisRotation: number, to:Coord,
  ):Command => ({
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
    return ((new PathData(parseSVG(d))).makePathAbsolute());
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

  cubicBezier(ctrl1: Coord, ctrl2: Coord, to: Coord):PathData {
    const command = COMMAND_FACTORY.C(ctrl1, ctrl2, to);
    this.commands.push(command);
    return this;
  }

  quadraticBezier(ctrl1: Coord, to: Coord):PathData {
    const command = COMMAND_FACTORY.Q(ctrl1, to);
    this.commands.push(command);
    return this;
  }

  smoothQuadraticBezier(to: Coord):PathData {
    const command = COMMAND_FACTORY.T(to);
    this.commands.push(command);
    return this;
  }

  elipticalArc(
    to: Coord, radiusX:number, radiusY:number, sweepFlag:boolean, largeArcFlag:boolean, xAxisRotation:number,
  ):PathData {
    const command = COMMAND_FACTORY.A(radiusX, radiusY, sweepFlag, largeArcFlag, xAxisRotation, to);
    this.commands.push(command);
    return this;
  }

  getLastMoveIndex(index) {
    for (let i = index - 1; i >= 0; i -= 1) {
      if (this.commands[i].code.toUpperCase() === 'M') {
        return i;
      }
    }
    return null;
  }

  // TODO: fix bug in conversion
  makePathAbsolute() {
    this.commands = this.commands.reduce((acc, command, index, commandsArray) => {
      const isRelative = command.code.toUpperCase() !== command.code;
      if (command.value) {
        // command is vert or horiz line (relative or abs)
        command.code = 'L';
        // @ts-ignore
        command.to = [...acc.at];
        const modParam = command.code.toUpperCase() === 'V' ? 1 : 0;
        if (isRelative) {
          command.to[modParam] += command.value;
        } else {
          command.to[modParam] = command.value;
        }
        delete command.value;
      } else if (isRelative) {
        // command is relative
        Object.keys(command).filter((prop) => TRANSFORMABLE_COMMAND_PROPS.includes(prop))
          .forEach((prop) => {
            command[prop] = addTuple(acc.at, command[prop]);
          });
        command.code = command.code.toUpperCase();
      }
      if (Number.isNaN(acc.at[0]) || Number.isNaN(acc.at[1])) {
        throw new Error('makePathAbsolute encountered NaN in on or more at coordinate values');
      }
      // @ts-ignore
      acc.at = command.code === 'Z' ? commandsArray[this.getLastMoveIndex(index)].to : command.to;
      // @ts-ignore
      acc.commands.push(command);
      return acc;
    }, { at: [0, 0], commands: [] }).commands;
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

  getDestinationPoints() {
    return this.commands.filter((cmd) => cmd.to !== undefined).map((cmd) => cmd.to);
  }

  transform(matrix:string) {
    this.commands = parseSVG(svgpath(this.getD()).transform(matrix).toString());
    return this;
  }

  getD():string {
    return composeSVG(this.commands);
  }
}
