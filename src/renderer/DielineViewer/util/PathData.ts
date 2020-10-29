import {
  cloneDeep, isNaN, includes,
} from 'lodash';
// @ts-ignore
import { Point } from '@flatten-js/core';
import svgpath from 'svgpath';

import { PointTuple, Coord } from '../../common/util/geom';

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

const commandToString = (command) => {
  if (command.code === 'Z') { return command.code; }
  if (includes(['L', 'M', 'T'], command.code)) {
    return `${command.code} ${command.to.join(',')}`;
  }
  if (command.code === 'Q') {
    return `${command.code} ${command.ctrl1.join(',')} ${command.to.join(',')}`;
  }
  if (command.code === 'C') {
    return `${command.code} ${command.ctrl1.join(',')} ${command.ctrl2.join(',')} ${command.to.join(',')}`;
  }
  if (command.code === 'S') {
    return `${command.code} ${command.ctrl2.join(',')} ${command.to.join(',')}`;
  }
  if (command.code === 'A') {
    return `${command.code} ${command.radius.join(',')} ${command.xAxisRotation} ${
      command.flags.map((flag) => (flag ? 1 : 0))} ${command.to.join(',')}`;
  }
  throw new Error('Unrecognized command code');
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
    radiusX: number, radiusY: number, xAxisRotation: number, sweepFlag: boolean, largeArcFlag: boolean, to:Coord,
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

const parseSVG = (d) => {
  const commandList = [];
  const absPath = svgpath(d).abs();
  // @ts-ignore
  absPath.iterate(([code, ...params], index, x, y) => {
    if (code === 'Z') {
      commandList.push(COMMAND_FACTORY.Z());
    }
    if (includes(['L', 'M', 'T'], code)) {
      commandList.push(COMMAND_FACTORY[code]([...params]));
    } else if (code === 'V' || code === 'H') {
      // V and H commands are irregular in that
      // they don't have a .to parameter and thus complicate iteration modifications
      // for convenience and consistency, convert to a L command
      commandList.push(COMMAND_FACTORY.L(code === 'V' ? [x, params[0]] : [params[0], y]));
    } else if (code === 'C') {
      commandList.push(COMMAND_FACTORY.C(
        [params[0], params[1]],
        [params[2], params[3]],
        [params[4], params[5]],
      ));
    } else if (code === 'Q' || code === 'S') {
      commandList.push(COMMAND_FACTORY.Q(
        [params[0], params[1]],
        [params[2], params[3]],
      ));
    } else if (code === 'A') {
      commandList.push(COMMAND_FACTORY.A(
        params[0], params[1], params[2], !!params[3], !!params[4], [params[5], params[6]],
      ));
    }
  });
  return commandList;
};

const composeSVG = (commands) => commands.map((command) => commandToString(command)).join(' ');

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

  ellipticalArc(
    radiusX:number, radiusY:number, xAxisRotation:number, sweepFlag:boolean, largeArcFlag:boolean, to: Coord,
  ):PathData {
    const command = COMMAND_FACTORY.A(radiusX, radiusY, xAxisRotation, sweepFlag, largeArcFlag, to);
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
