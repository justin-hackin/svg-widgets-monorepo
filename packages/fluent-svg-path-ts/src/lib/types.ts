import { TransformObject } from 'svg-path-commander';

export enum CommandCodes { M = 'M', L = 'L', C = 'C', S = 'S', Q = 'Q', T = 'T', A = 'A', Z = 'Z' }

export interface BaseCommand {
  code: CommandCodes,
}

export interface RawPoint {
  x: number,
  y: number,
}

export interface PointLike extends RawPoint {
  [x: string]: any
}

export type PointTuple = [number, number];
export type Coord = PointTuple | PointLike;

export interface DestinationCommand extends BaseCommand {
  to: RawPoint
}

export interface MoveCommand extends DestinationCommand {
  code: CommandCodes.M
}

export interface LineCommand extends DestinationCommand {
  code: CommandCodes.L
}

export interface CubicBezierCommand extends DestinationCommand {
  code: CommandCodes.C
  ctrl1: RawPoint
  ctrl2: RawPoint
}

export interface SymmetricCubicBezierCommand extends DestinationCommand {
  code: CommandCodes.S
  ctrl2: RawPoint
}

export interface QuadraticBezierCommand extends DestinationCommand {
  code: CommandCodes.Q
  ctrl1: RawPoint
}

export interface SymmetricQuadraticBezierCommand extends DestinationCommand {
  code: CommandCodes.T
}

export interface ArcCommand extends DestinationCommand {
  code: CommandCodes.A
  rx: number
  ry: number
  sweepFlag: boolean
  largeArcFlag: boolean
  xAxisRotation: number
}

export interface CloseCommand extends BaseCommand {
  code: CommandCodes.Z
}

export type Command = MoveCommand
| LineCommand
| CubicBezierCommand
| SymmetricCubicBezierCommand
| QuadraticBezierCommand
| SymmetricQuadraticBezierCommand
| ArcCommand
| CloseCommand;

export type BezierCommand = QuadraticBezierCommand | SymmetricQuadraticBezierCommand |
CubicBezierCommand | SymmetricCubicBezierCommand;
export type OnlyToParamCommand = LineCommand | MoveCommand | SymmetricQuadraticBezierCommand;
export type ImmutableCommandArray = ReadonlyArray<Command>;

export type PartialTransformObject = Partial<TransformObject>;

export interface BoundingBoxAttrs {
  xmin: number
  ymin: number
  xmax: number
  ymax: number
  width: number
  height: number
}
