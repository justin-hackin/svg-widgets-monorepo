import {
  ArcCommand,
  BezierCommand,
  CloseCommand,
  Command,
  CommandCodes,
  Coord,
  CubicBezierCommand,
  DestinationCommand,
  LineCommand,
  MoveCommand,
  OnlyToParamCommand,
  QuadraticBezierCommand,
  SymmetricCubicBezierCommand,
  SymmetricQuadraticBezierCommand,
} from '@/common/PathData/types';
import type { PathData } from '@/common/PathData/index';
import { castCoordToRawPoint, rawPointToString } from '@/common/PathData/geom';
import SVGPathCommander, { TransformObject } from 'svg-path-commander';
import { getSVGMatrix } from '@/common/PathData/matrix.ts/getSVGMatrix';
import CSSMatrix, { Matrix } from '@thednp/dommatrix';

// why isn't return type accurate here? why can't it be explicitly defined
function last<T>(arr: T[] | ReadonlyArray<T>): null | T {
  return arr.length > 0 ? arr[arr.length - 1] : null;
}

export const hasOnlyToParam = (command: Command): command is OnlyToParamCommand => [
  CommandCodes.L, CommandCodes.M, CommandCodes.T,
].includes((command as OnlyToParamCommand).code);

export const BEZIER_COMMAND_CODES = [CommandCodes.Q, CommandCodes.T, CommandCodes.C, CommandCodes.S];
export const isBezierCommand = (command: Command): command is BezierCommand => BEZIER_COMMAND_CODES.includes(
  (command as BezierCommand).code,
);
// TODO: how to make this custom type guard, return type "command is DestinationCommand" does not work
// TODO: remove casting in getDestinationPoints
export const isDestinationCommand = (command: Command): boolean => !!((command as DestinationCommand).to);
export const commandToString = (command) => {
  if (command.code === CommandCodes.Z) {
    return command.code;
  }
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
export const commandFactory = {
  M: (to: Coord): MoveCommand => ({
    code: CommandCodes.M,
    to: castCoordToRawPoint(to),
  }),
  L: (to: Coord): LineCommand => ({
    code: CommandCodes.L,
    to: castCoordToRawPoint(to),
  }),
  C: (ctrl1: Coord, ctrl2: Coord, to: Coord): CubicBezierCommand => ({
    code: CommandCodes.C,
    to: castCoordToRawPoint(to),
    ctrl1: castCoordToRawPoint(ctrl1),
    ctrl2: castCoordToRawPoint(ctrl2),
  }),
  S: (ctrl2, to): SymmetricCubicBezierCommand => ({
    code: CommandCodes.S,
    to: castCoordToRawPoint(to),
    ctrl2: castCoordToRawPoint(ctrl2),
  }),
  Q: (ctrl1: Coord, to: Coord): QuadraticBezierCommand => ({
    code: CommandCodes.Q,
    to: castCoordToRawPoint(to),
    ctrl1: castCoordToRawPoint(ctrl1),
  }),
  T: (to: Coord): SymmetricQuadraticBezierCommand => ({
    code: CommandCodes.T,
    to: castCoordToRawPoint(to),
  }),
  A: (
    radiusX: number,
    radiusY: number,
    xAxisRotation: number,
    largeArcFlag: boolean,
    sweepFlag: boolean,
    to: Coord,
  ): ArcCommand => ({
    code: CommandCodes.A,
    rx: radiusX,
    ry: radiusY,
    largeArcFlag,
    sweepFlag,
    xAxisRotation,
    to: castCoordToRawPoint(to),
  }),
  Z: (): CloseCommand => ({
    code: CommandCodes.Z,
  }),
};
export const parseSVG = (d:string):Command[] => {
  // normalize removes H/V
  const absPathCmdr = (new SVGPathCommander(d)).normalize().toAbsolute();
  return absPathCmdr.segments.reduce((commandList, segment) => {
    const [code, ...params] = segment;
    const castParams = params as number[];
    if (code === 'Z') {
      commandList.push(commandFactory.Z());
    }
    if (['L', 'M', 'T'].includes(code)) {
      commandList.push(commandFactory[code]([...params]));
    } else if (code === 'C') {
      const castParams = params as number[];
      commandList.push(commandFactory.C(
        [castParams[0], castParams[1]],
        [castParams[2], castParams[3]],
        [castParams[4], castParams[5]],
      ));
    } else if (code === 'Q' || code === 'S') {
      const castParams = params as number[];
      commandList.push(commandFactory.Q(
        [castParams[0], castParams[1]],
        [castParams[2], castParams[3]],
      ));
    } else if (code === 'A') {
      commandList.push(
        commandFactory.A(
          castParams[0],
          castParams[1],
          castParams[2],
          !!castParams[3],
          !!castParams[4],
          [castParams[5], castParams[6]],
        ),
      );
    }
    return commandList;
  }, [] as Command[]);
};
export const composeSVG = (commands): string => commands.map((command) => commandToString(command))
  .join(' ');

export function getSegmentStartIndex(path: PathData, atIndex: number | undefined = undefined): number | null {
  const index = atIndex || path.commands.length - 1;
  for (let i = index - 1; i >= 0; i -= 1) {
    if (path.commands[i].code === CommandCodes.M) {
      return i;
    }
    // use recursive because M0,0 L1,1 Z L2,2 Z L3,3 is still valid svg (based on Inkscape manual test not formal def)
    if (path.commands[i].code === CommandCodes.Z) {
      return getSegmentStartIndex(path, i - 1);
    }
  }
  return null;
}

export function getCurrentSegmentStart(path: PathData) {
  const segmentStartIndex = getSegmentStartIndex(path);
  if (segmentStartIndex === null) { return null; }
  return (path.commands[segmentStartIndex] as DestinationCommand).to;
}

export function getLastPosition(path: PathData) {
  const lastCommand = last(path.commands);
  if (!lastCommand) { return undefined; }
  return lastCommand?.code === CommandCodes.Z
    ? getCurrentSegmentStart(path) : (lastCommand as DestinationCommand).to;
}

export function getDestinationPoints(path: PathData) {
  return path.commands.filter((cmd) => isDestinationCommand(cmd))
    .map((cmd) => (cmd as DestinationCommand).to);
}

export function convertTransformObjectToDOMMatrixReadOnly(trans: Partial<TransformObject>): DOMMatrixReadOnly {
  const cssMatrix = getSVGMatrix({
    ...trans,
    origin: [0, 0, 0],
  });
  const arr = CSSMatrix.toArray(cssMatrix, true) as Matrix;
  return new DOMMatrixReadOnly(arr);
}

export function clone<T>(target: T): T {
  return JSON.parse(JSON.stringify(target));
}
