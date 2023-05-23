import SVGPathCommander, {
  ArcSegment,
  CubicSegment, PathArray, PathSegment, TransformObject,
} from 'svg-path-commander';
import CSSMatrix, { Matrix } from '@thednp/dommatrix';
import type { PathData } from '@/common/PathData/module';
import {
  ArcCommand,
  BezierCommand,
  CloseCommand,
  Command,
  CommandCodes,
  Coord,
  CubicBezierCommand,
  DestinationCommand, ImmutableCommandArray,
  LineCommand,
  MoveCommand,
  OnlyToParamCommand,
  QuadraticBezierCommand,
  SymmetricCubicBezierCommand,
  SymmetricQuadraticBezierCommand,
} from './types';
import { castCoordToRawPoint, rawPointToString } from './geom';
import { getSVGMatrix } from './matrix';

// why isn't return type accurate here? why can't it be explicitly defined
function last<T>(arr: T[] | ReadonlyArray<T>): null | T {
  return arr.length > 0 ? arr[arr.length - 1] : null;
}

// https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_chunk
export function chunk<T>(arr: T[], size: number) {
  return Array.from(
    { length: Math.ceil(arr.length / size) },
    (_: T, i: number) => arr.slice(i * size, i * size + size),
  );
}

const hasOnlyToParam = (command: Command): command is OnlyToParamCommand => [
  CommandCodes.L, CommandCodes.M, CommandCodes.T,
].includes((command as OnlyToParamCommand).code);

export const booleanToFlag = (flag:boolean) => (flag ? 1 : 0);

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
    return `${command.code} ${command.rx} ${command.ry} ${command.xAxisRotation} ${
      booleanToFlag(command.largeArcFlag)} ${booleanToFlag(command.sweepFlag)} ${rawPointToString(command.to)}`;
  }
  throw new Error('Unrecognized command code');
};
export const CommandFactory = {
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
  // the fluent interface doesn't use this command and instead estimates an arc with cubic
  // it remains here for those who wish to unsafely create and array of commands to naively render path d
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

export function segmentsToCommandArray(segments: PathArray): Command[] {
  return segments.reduce((commandList, segment: PathSegment) => {
    const resolvedSegment = segment[0] === 'A' ? SVGPathCommander
    // @ts-ignore
      .arcToCubic(...(segment as ArcSegment).slice(1)) as CubicSegment : segment;
    const [code, ...params] = resolvedSegment;
    const castParams = params as number[];
    if (code === 'Z') {
      commandList.push(CommandFactory.Z());
    }
    if (['L', 'M', 'T'].includes(code)) {
      commandList.push(CommandFactory[code]([...params]));
    } else if (code === 'C') {
      commandList.push(CommandFactory.C(
        [castParams[0], castParams[1]],
        [castParams[2], castParams[3]],
        [castParams[4], castParams[5]],
      ));
    } else if (code === 'Q' || code === 'S') {
      commandList.push(CommandFactory.Q(
        [castParams[0], castParams[1]],
        [castParams[2], castParams[3]],
      ));
    }
    return commandList;
  }, [] as Command[]);
}

export const pathDToCommandArray = (d:string):Command[] => {
  // normalize removes H/V
  const absPathCmdr = SVGPathCommander.normalizePath(SVGPathCommander.normalizePath(d));
  return segmentsToCommandArray(absPathCmdr);
};

export function commandArrayToPathD(commands: ImmutableCommandArray): string {
  return commands.map((command) => commandToString(command)).join(' ');
}

export function commandArrayToPathArray(commands: ImmutableCommandArray): PathArray {
  return SVGPathCommander.parsePathString(commandArrayToPathD(commands));
}

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