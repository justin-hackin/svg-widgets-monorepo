import { cloneDeep, includes, last } from 'lodash-es';
import svgpath from 'svgpath';
import { reverse } from 'svg-path-reverse';
import {
  castCoordToRawPoint, Coord, PointLike, pointsAreEqual, RawPoint, rawPointToString,
} from '../util/geom';
import { roundedEdgePath } from './shapes/generic';

/* eslint-disable no-param-reassign */

enum CommandCodes { M = 'M', L = 'L', C = 'C', S = 'S', Q = 'Q', T = 'T', A = 'A', Z = 'Z' }

export interface DestinationCommand {
  to: RawPoint
}

interface MoveCommand extends DestinationCommand {
  code: CommandCodes.M
}

interface LineCommand extends DestinationCommand {
  code: CommandCodes.L
}

interface CubicBezierCommand extends DestinationCommand {
  code: CommandCodes.C
  ctrl1: RawPoint
  ctrl2: RawPoint
}

interface SymmetricCubicBezierCommand extends DestinationCommand {
  code: CommandCodes.S
  ctrl2: RawPoint
}

interface QuadraticBezierCommand extends DestinationCommand {
  code: CommandCodes.Q
  ctrl1: RawPoint
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
    return `${command.code} ${rawPointToString(command.to)}`;
  }
  if (command.code === CommandCodes.Q) {
    return `${command.code} ${rawPointToString(command.ctrl1)} ${rawPointToString(command.to)}`;
  }
  if (command.code === CommandCodes.C) {
    return `${command.code} ${rawPointToString(command.ctrl1)} ${rawPointToString(command.ctrl2)} ${
      rawPointToString(command.to)}`;
  }
  if (command.code === CommandCodes.S) {
    return `${command.code} ${command.ctrl2} ${rawPointToString(command.to)}`;
  }
  if (command.code === CommandCodes.A) {
    const booleanToFlag = (flag) => (flag ? 1 : 0);
    return `${command.code} ${command.rx} ${command.ry} ${command.xAxisRotation} ${
      booleanToFlag(command.sweepFlag)} ${booleanToFlag(command.largeArcFlag)} ${rawPointToString(command.to)}`;
  }
  throw new Error('Unrecognized command code');
};

export const COMMAND_FACTORY = {
  M: (to:Coord):MoveCommand => ({
    code: CommandCodes.M,
    to: castCoordToRawPoint(to),
  }),
  L: (to:Coord):LineCommand => ({
    code: CommandCodes.L,
    to: castCoordToRawPoint(to),
  }),
  C: (ctrl1:Coord, ctrl2:Coord, to:Coord):CubicBezierCommand => ({
    code: CommandCodes.C,
    to: castCoordToRawPoint(to),
    ctrl1: castCoordToRawPoint(ctrl1),
    ctrl2: castCoordToRawPoint(ctrl2),
  }),
  S: (ctrl2, to):SymmetricCubicBezierCommand => ({
    code: CommandCodes.S,
    to: castCoordToRawPoint(to),
    ctrl2: castCoordToRawPoint(ctrl2),
  }),
  Q: (ctrl1:Coord, to:Coord): QuadraticBezierCommand => ({
    code: CommandCodes.Q,
    to: castCoordToRawPoint(to),
    ctrl1: castCoordToRawPoint(ctrl1),
  }),
  T: (to:Coord):SymmetricQuadraticBezierCommand => ({
    code: CommandCodes.T,
    to: castCoordToRawPoint(to),
  }),
  A: (
    radiusX: number,
    radiusY: number,
    xAxisRotation: number,
    largeArcFlag: boolean,
    sweepFlag: boolean,
    to:Coord,
  ):ArcCommand => ({
    code: CommandCodes.A,
    rx: radiusX,
    ry: radiusY,
    largeArcFlag,
    sweepFlag,
    xAxisRotation,
    to: castCoordToRawPoint(to),
  }),
  Z: ():CloseCommand => ({
    code: CommandCodes.Z,
  }),
};

const parseSVG = (d) => {
  const commandList = [];
  const absPath = svgpath(d).abs();
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
      commandList.push(
        COMMAND_FACTORY.A(params[0], params[1], params[2], !!params[3], !!params[4], [params[5], params[6]]),
      );
    }
  });
  return commandList;
};

const composeSVG = (commands) => commands.map((command) => commandToString(command)).join(' ');

export class PathData {
  public commands: Command[];

  constructor(d?: string) {
    // TODO: check instance type
    this.commands = d ? parseSVG(d) : [];
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
    const lastCommand = this.commands[this.commands.length - 1];
    if (isBezierCommand(lastCommand)) {
      throw new Error(`expected last command to be a bezier (command code one of ${BEZIER_COMMAND_CODES
      }) but instead saw ${lastCommand.code}`);
    }
  }

  move(to:Coord):PathData {
    this.commands.push(COMMAND_FACTORY.M(to));
    return this;
  }

  line(to:Coord):PathData {
    this._assertLastCommandExists();
    this.commands.push(COMMAND_FACTORY.L(to));
    return this;
  }

  close():PathData {
    this._assertLastCommandExists();
    this.commands.push(COMMAND_FACTORY.Z());
    return this;
  }

  cubicBezier(ctrl1: Coord, ctrl2: Coord, to: Coord):PathData {
    this._assertLastCommandExists();
    this.commands.push(COMMAND_FACTORY.C(ctrl1, ctrl2, to));
    return this;
  }

  smoothCubicBezier(ctrl2: Coord, to: Coord):PathData {
    this._assertLastCommandIsBezier();
    this.commands.push(COMMAND_FACTORY.S(ctrl2, to));
    return this;
  }

  quadraticBezier(ctrl1: Coord, to: Coord):PathData {
    this._assertLastCommandExists();
    this.commands.push(COMMAND_FACTORY.Q(ctrl1, to));
    return this;
  }

  smoothQuadraticBezier(to: Coord):PathData {
    this._assertLastCommandIsBezier();
    this.commands.push(COMMAND_FACTORY.T(to));
    return this;
  }

  ellipticalArc(
    radiusX:number,
    radiusY:number,
    xAxisRotation:number,
    largeArcFlag:boolean,
    sweepFlag:boolean,
    to: Coord,
  ):PathData {
    this._assertLastCommandExists();
    this.commands.push(COMMAND_FACTORY.A(radiusX, radiusY, xAxisRotation, largeArcFlag, sweepFlag, to));
    return this;
  }

  clone() {
    return (new PathData()).concatPath(this);
  }

  reverse():PathData {
    this.commands = parseSVG(reverse(this.getD()));
    return this;
  }

  getSegmentStartIndex(atIndex = undefined):number {
    const index = atIndex || this.commands.length - 1;
    for (let i = index - 1; i >= 0; i -= 1) {
      if (this.commands[i].code === 'M') {
        return i;
      }
      // use recursive because M0,0 L1,1 Z L2,2 Z L3,3 is still valid svg (based on Inkscape manual test not formal def)
      if (this.commands[i].code === 'Z') {
        return this.getSegmentStartIndex(i - 1);
      }
    }
    throw new Error(
      `PathData getSegmentStartIndex: failed to find a start position before index "${index
      }". Do you have a PathData instance without any Z or M commands in it?`,
    );
  }

  get currentSegmentStart(): PointLike {
    return (this.commands[this.getSegmentStartIndex()] as DestinationCommand).to;
  }

  get lastPosition():PointLike {
    return this.lastCommand.code === CommandCodes.Z
      ? this.currentSegmentStart : (this.lastCommand as DestinationCommand).to;
  }

  concatCommands(commands):PathData {
    this.commands = this.commands.concat(cloneDeep(commands));
    return this;
  }

  concatPath(path):PathData {
    this.commands = this.commands.concat(cloneDeep(path.commands));
    return this;
  }

  get lastCommand(): Command {
    return this.commands[this.commands.length - 1];
  }

  get endPoint(): PointLike {
    if (this.lastCommand.code === CommandCodes.Z) {
      return this.currentSegmentStart;
    }
    return this.lastCommand.to;
  }

  curvedLineSegments(toPoints, roundingRatio: number, endWithClose = false) {
    // TODO: handle last command is close
    this._assertLastCommandExists();
    const modifiedPoints = this.commands.length ? [this.endPoint, ...toPoints] : [...toPoints];
    if (endWithClose) {
      modifiedPoints.push(this.currentSegmentStart);
    }
    const toAppendCommands = roundedEdgePath(modifiedPoints, roundingRatio).commands
      // include move command if the path doesn't have any commands yet
      .slice(this.commands.length ? 1 : 0, endWithClose ? -1 : undefined);
    this.commands = this.commands.concat(toAppendCommands);
    if (endWithClose) { this.close(); }
    return this;
  }

  breakApart(): PathData[] {
    return this.commands
      .reduce((acc, command, index, array) => {
        if (command.code === CommandCodes.M) {
          if (!index) {
            acc.currentPath.commands.push({ ...command });
          } else {
            acc.subPaths.push(acc.currentPath);
            acc.currentPath = (new PathData());
            acc.currentPath.commands.push({ ...command });
          }
          return acc;
        }
        if (command.code === CommandCodes.Z) {
          acc.currentPath.commands.push(command);
          acc.subPaths.push(acc.currentPath);
          acc.currentPath = new PathData();
          return acc;
        }

        // svg paths can be closed and continued without a following M command, account for this by adding M
        // TODO: Why is "as Command" casting needed here to avoid ts lint error?
        if (acc.currentPath.commands.length === 0 && (command as Command).code !== CommandCodes.M) {
          if (!acc.subPaths.length) {
            throw new Error('PathData breakApart: discovered no opening M command for path');
          }
          const pathStart = last(acc.subPaths).currentSegmentStart;
          acc.currentPath.commands.push(COMMAND_FACTORY.M(pathStart));
        }
        acc.currentPath.commands.push(command);
        if (index === array.length - 1) {
          acc.subPaths.push(acc.currentPath);
        }
        return acc;
      }, { subPaths: [], currentPath: (new PathData()) } as (
        { subPaths: PathData[], currentPath: PathData }
      )).subPaths;
  }

  weldPath(path: PathData, closesPath = false, marginOfError = undefined):PathData {
    if (!pointsAreEqual(this.lastPosition, (path.commands[0] as DestinationCommand).to, marginOfError)) {
      throw new Error('invalid use of weldPath: first parameter path must'
        + ' start at the same position as the end of path instance end position');
    }
    if (closesPath && !pointsAreEqual(path.lastPosition, this.currentSegmentStart)) {
      throw new Error('invalid use of weldPath: when using closesPath option, instance\'s currentSegementStart '
        + 'must be equal to the last command of first parameter path\'s lastPosition');
    }
    this.commands = this.commands.concat(...path.commands.slice(1, closesPath ? -1 : undefined));
    if (closesPath) { this.close(); }
    return this;
  }

  getDestinationPoints() {
    return this.commands.filter((cmd) => isDestinationCommand(cmd))
      .map((cmd) => (cmd as DestinationCommand).to);
  }

  // TODO: getControlPoints, getInferredControlPoints

  transform(matrix:string) {
    this.commands = parseSVG(svgpath(this.getD()).transform(matrix).toString());
    return this;
  }

  getD():string {
    return composeSVG(this.commands);
  }
}
