import { cloneDeep, isNaN, includes } from 'lodash';
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

enum CommandCodes { M='M', L='L', C='C', S='S', Q='Q', T='T', A='A', Z='Z' }

interface DestinationCommand {
  to: PointTuple
}

interface MoveCommand extends DestinationCommand {
  code: CommandCodes.M
}

interface LineCommand extends DestinationCommand {
  code: CommandCodes.L
}

interface CubicBezierCommand extends DestinationCommand {
  code: CommandCodes.C
  ctrl1: PointTuple
  ctrl2: PointTuple
}

interface SymmetricCubicBezierCommand extends DestinationCommand{
  code: CommandCodes.S
  ctrl2: PointTuple
}

interface QuadraticBezierCommand extends DestinationCommand {
  code: CommandCodes.Q
  ctrl1: PointTuple
}

interface SymmetricQuadraticBezierCommand extends DestinationCommand {
  code: CommandCodes.T
}

interface ArcCommand extends DestinationCommand {
  code: CommandCodes.A
  rx: number
  ry: number
  sweepFlag: boolean
  largeArcFlag: boolean
  xAxisRotation: number
}

interface CloseCommand {
  code: CommandCodes.Z
}

type Command = MoveCommand | LineCommand | CubicBezierCommand | SymmetricCubicBezierCommand | QuadraticBezierCommand
| SymmetricQuadraticBezierCommand | ArcCommand | CloseCommand;

type BezierCommand = QuadraticBezierCommand | SymmetricQuadraticBezierCommand |
CubicBezierCommand | SymmetricCubicBezierCommand;

const BEZIER_COMMAND_CODES = [CommandCodes.Q, CommandCodes.T, CommandCodes.C, CommandCodes.S];
type OnlyToParamCommand = LineCommand | MoveCommand | SymmetricQuadraticBezierCommand;
const hasOnlyToParam = (command: Command): command is OnlyToParamCommand => includes(
  [CommandCodes.L, CommandCodes.M, CommandCodes.T],
  (command as OnlyToParamCommand).code,
);

const isBezierCommand = (command: Command): command is BezierCommand => includes(
  BEZIER_COMMAND_CODES,
  (command as BezierCommand).code,
);

// TODO: how to make this custom type guard, return type "command is DestinationCommand" does not work
// TODO: remove casting in getDestinationPoints
const isDestinationCommand = (command: Command): boolean => !!((command as DestinationCommand).to);

const commandToString = (command) => {
  if (command.code === CommandCodes.Z) { return command.code; }
  if (hasOnlyToParam(command)) {
    return `${command.code} ${command.to.join(',')}`;
  }
  if (command.code === CommandCodes.Q) {
    return `${command.code} ${command.ctrl1.join(',')} ${command.to.join(',')}`;
  }
  if (command.code === CommandCodes.C) {
    return `${command.code} ${command.ctrl1.join(',')} ${command.ctrl2.join(',')} ${command.to.join(',')}`;
  }
  if (command.code === CommandCodes.S) {
    return `${command.code} ${command.ctrl2.join(',')} ${command.to.join(',')}`;
  }
  if (command.code === CommandCodes.A) {
    const booleanToFlag = (flag) => (flag ? 1 : 0);
    return `${command.code} ${command.rx} ${command.ry} ${command.xAxisRotation} ${
      booleanToFlag(command.sweepFlag)} ${booleanToFlag(command.largeArcFlag)} ${command.to.join(',')}`;
  }
  throw new Error('Unrecognized command code');
};

export const COMMAND_FACTORY: Record<CommandCodes, (...any)=> Command> = {
  M: (to:Coord):MoveCommand => ({
    code: CommandCodes.M,
    to: castToArray(to),
  }),
  L: (to:Coord):LineCommand => ({
    code: CommandCodes.L,
    to: castToArray(to),
  }),
  C: (ctrl1:Coord, ctrl2:Coord, to:Coord):CubicBezierCommand => ({
    code: CommandCodes.C,
    to: castToArray(to),
    ctrl1: castToArray(ctrl1),
    ctrl2: castToArray(ctrl2),
  }),
  S: (ctrl2, to):SymmetricCubicBezierCommand => ({
    code: CommandCodes.S,
    to: castToArray(to),
    ctrl2: castToArray(ctrl2),
  }),
  Q: (ctrl1:Coord, to:Coord): QuadraticBezierCommand => ({
    code: CommandCodes.Q,
    to: castToArray(to),
    ctrl1: castToArray(ctrl1),
  }),
  T: (to:Coord):SymmetricQuadraticBezierCommand => ({
    code: CommandCodes.T,
    to: castToArray(to),
  }),
  A: (
    radiusX: number, radiusY: number, xAxisRotation: number, sweepFlag: boolean, largeArcFlag: boolean, to:Coord,
  ):ArcCommand => ({
    code: CommandCodes.A,
    rx: radiusX,
    ry: radiusY,
    sweepFlag,
    largeArcFlag,
    xAxisRotation,
    to: castToArray(to),
  }),
  Z: () => ({
    code: CommandCodes.Z,
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
  private _commands: Command[];

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
    const lastCommand = this._commands[this._commands.length - 1];
    if (isBezierCommand(lastCommand)) {
      throw new Error(`expected last command to be a bezier (command code one of ${BEZIER_COMMAND_CODES
      }) but instead saw ${lastCommand.code}`);
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
    return this._commands.filter((cmd) => isDestinationCommand(cmd))
      .map((cmd) => (cmd as DestinationCommand).to);
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
