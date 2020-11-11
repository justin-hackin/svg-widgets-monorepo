import {
  cloneDeep, isNaN, includes, last,
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

const BEZIER_COMMAND_CODES = ['Q', 'T', 'C', 'S'];

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
  M: (to:Coord) => ({
    code: 'M',
    to: castToArray(to),
  }),
  L: (to:Coord) => ({
    code: 'L',
    to: castToArray(to),
  }),
  C: (ctrl1:Coord, ctrl2:Coord, to:Coord) => ({
    code: 'C',
    to: castToArray(to),
    ctrl1: castToArray(ctrl1),
    ctrl2: castToArray(ctrl2),
  }),
  S: (ctrl2, to) => ({
    code: 'S',
    to: castToArray(to),
    ctrl2: castToArray(ctrl2),
  }),
  Q: (ctrl1:Coord, to:Coord) => ({
    code: 'Q',
    to: castToArray(to),
    ctrl1: castToArray(ctrl1),
  }),
  T: (to:Coord) => ({
    code: 'T',
    to: castToArray(to),
  }),
  A: (
    radiusX: number, radiusY: number, xAxisRotation: number, sweepFlag: boolean, largeArcFlag: boolean, to:Coord,
  ) => ({
    code: 'A',
    rx: radiusX,
    ry: radiusY,
    flags: [sweepFlag, largeArcFlag],
    to: castToArray(to),
    xAxisRotation,

  }),
  Z: () => ({
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


export class PathData {
  private _commands;

  constructor(d?: string) {
    // TODO: check instance type
    this._commands = d ? parseSVG(d) : [];
    return this;
  }

  private get _lastCommandExists() {
    return !!this.commands.length;
  }

  private _assertLastCommandExists() {
    if (!this._lastCommandExists) {
      throw new Error('expected last command to exist but instead found empty commands list');
    }
  }

  private _assertLastCommandIsBezier() {
    this._assertLastCommandExists();
    // @ts-ignore
    const lastCode = last(this._commands).code;

    if (!includes(BEZIER_COMMAND_CODES, lastCode)) {
      throw new Error(`expected last command to be a bezier (command code one of ${BEZIER_COMMAND_CODES
      }) but instead saw ${lastCode}`);
    }
  }


  get commands() {
    return this._commands;
  }

  move(to):PathData {
    const command = COMMAND_FACTORY.M(to);
    this._commands.push(command);
    return this;
  }

  line(to):PathData {
    this._assertLastCommandExists();
    const command = COMMAND_FACTORY.L(to);
    this._commands.push(command);
    return this;
  }

  close():PathData {
    this._assertLastCommandExists();
    const command = COMMAND_FACTORY.Z();
    this._commands.push(command);
    return this;
  }

  cubicBezier(ctrl1: Coord, ctrl2: Coord, to: Coord):PathData {
    this._assertLastCommandExists();
    const command = COMMAND_FACTORY.C(ctrl1, ctrl2, to);
    this._commands.push(command);
    return this;
  }

  smoothCubicBezier(ctrl2: Coord, to: Coord):PathData {
    this._assertLastCommandIsBezier();
    const command = COMMAND_FACTORY.S(ctrl2, to);
    this._commands.push(command);
    return this;
  }

  quadraticBezier(ctrl1: Coord, to: Coord):PathData {
    this._assertLastCommandExists();
    const command = COMMAND_FACTORY.Q(ctrl1, to);
    this._commands.push(command);
    return this;
  }

  smoothQuadraticBezier(to: Coord):PathData {
    this._assertLastCommandIsBezier();
    const command = COMMAND_FACTORY.T(to);
    this._commands.push(command);
    return this;
  }

  ellipticalArc(
    radiusX:number, radiusY:number, xAxisRotation:number, sweepFlag:boolean, largeArcFlag:boolean, to: Coord,
  ):PathData {
    const command = COMMAND_FACTORY.A(radiusX, radiusY, xAxisRotation, sweepFlag, largeArcFlag, to);
    this._commands.push(command);
    return this;
  }

  getLastMoveIndex(index) {
    for (let i = index - 1; i >= 0; i -= 1) {
      if (this._commands[i].code.toUpperCase() === 'M') {
        return i;
      }
    }
    return null;
  }

  concatCommands(_commands):PathData {
    this._commands = this._commands.concat(cloneDeep(_commands));
    return this;
  }

  concatPath(path):PathData {
    this._commands = this._commands.concat(cloneDeep(path._commands));
    return this;
  }

  // TODO: make this weldPath, throws error if first command in param doesn't match last endpoint
  // this could lead to the rendering of invalid svg
  // meant to be used in conjunction with concatPath to fuse paths that start and end at same the point
  sliceCommandsDangerously(...params):PathData {
    this._commands = this._commands.slice(...params);
    return this;
  }

  getDestinationPoints() {
    return this._commands.filter((cmd) => cmd.to !== undefined).map((cmd) => cmd.to);
  }

  // TODO: getControlPoints, getInferredControlPoints

  transform(matrix:string) {
    this._commands = parseSVG(svgpath(this.getD()).transform(matrix).toString());
    return this;
  }

  getD():string {
    return composeSVG(this._commands);
  }
}
