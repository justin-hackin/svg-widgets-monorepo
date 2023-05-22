import { produce } from 'immer';
import { Producer } from 'immer/src/types/types-external';
import SVGPathCommander, { TransformObject } from 'svg-path-commander';
import { Command, Coord, ImmutableCommandArray } from './types';
import {
  booleanToFlag, chunk,
  clone,
  commandArrayToPathD,
  CommandFactory,
  getLastPosition,
  pathDToCommandArray,
} from './helpers';
import { validatePushCommand } from './validation';
import { transformByMatrixProducer, transformByObjectProducer } from './producers';
import { castCoordToRawPoint } from './geom';

export class PathData {
  private _commands: ImmutableCommandArray = [];

  get commands() {
    return this._commands;
  }

  constructor(d?: string) {
    if (d) {
      const parsedD = pathDToCommandArray(d);
      if (parsedD) {
        this.concatCommands(parsedD);
      }
    }
  }

  pushCommand(command: Command) {
    validatePushCommand(this._commands, command);
    this._commands = produce(this._commands, (commands) => {
      commands.push(clone(command));
    });
  }

  concatCommands(commands: Command[] | ImmutableCommandArray): PathData {
    for (const command of commands) {
      this.pushCommand(command);
    }
    return this;
  }

  move(to: Coord): PathData {
    this.pushCommand(CommandFactory.M(to));
    return this;
  }

  line(to: Coord): PathData {
    this.pushCommand(CommandFactory.L(to));
    return this;
  }

  close(): PathData {
    this.pushCommand(CommandFactory.Z());
    return this;
  }

  cubicBezier(ctrl1: Coord, ctrl2: Coord, to: Coord): PathData {
    this.pushCommand(CommandFactory.C(ctrl1, ctrl2, to));
    return this;
  }

  smoothCubicBezier(ctrl2: Coord, to: Coord): PathData {
    this.pushCommand(CommandFactory.S(ctrl2, to));
    return this;
  }

  quadraticBezier(ctrl1: Coord, to: Coord): PathData {
    this.pushCommand(CommandFactory.Q(ctrl1, to));
    return this;
  }

  smoothQuadraticBezier(to: Coord): PathData {
    this.pushCommand(CommandFactory.T(to));
    return this;
  }

  // in order to support matrix transformations, this function will
  // apply an estimation of one or more cubics instead of arc command
  ellipticalArc(
    radiusX: number,
    radiusY: number,
    xAxisRotation: number,
    largeArcFlag: boolean,
    sweepFlag: boolean,
    to: Coord,
  ): PathData {
    const lastPos = getLastPosition(this);
    if (!lastPos) {
      throw new Error('could not resolve last position');
    }
    const toRaw = castCoordToRawPoint(to);
    const cubics = SVGPathCommander.arcToCubic(
      lastPos.x,
      lastPos.y,
      radiusX,
      radiusY,
      xAxisRotation,
      booleanToFlag(largeArcFlag),
      booleanToFlag(sweepFlag),
      toRaw.x,
      toRaw.y,
    );
    chunk(cubics, 6).forEach((cubic) => {
      this.pushCommand(CommandFactory.C(
        { x: cubic[0], y: cubic[1] },
        { x: cubic[2], y: cubic[3] },
        { x: cubic[4], y: cubic[5] },
      ));
    });
    return this;
  }

  clone() {
    return (new PathData()).concatPath(this);
  }

  dangerouslyProduceCommands(produceFn: Producer<ImmutableCommandArray>) {
    this._commands = produce(this._commands, produceFn);
  }

  concatPath(path: PathData): PathData {
    this.concatCommands(path.commands);
    return this;
  }

  transformByObject(transformObject: Partial<TransformObject>) {
    this._commands = transformByObjectProducer(this._commands, transformObject);
    return this;
  }

  transformByMatrix(matrix: DOMMatrixReadOnly) {
    this._commands = transformByMatrixProducer(this._commands, matrix);
    return this;
  }

  getD():string {
    return commandArrayToPathD(this._commands);
  }
}
