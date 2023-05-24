import { produce } from 'immer';
import SVGPathCommander, { TransformObject } from 'svg-path-commander';
import { Command, Coord, ImmutableCommandArray } from './types';
import {
  booleanToFlag,
  chunk,
  clone,
  commandArrayToPathD,
  CommandFactory,
  getLastPosition,
  pathDToCommandArray,
} from './helpers';
import { validatePushCommand } from './validation';
import { reversePathRecipe, transformByMatrixProducer, transformByObjectProducer } from './producers';
import { castCoordToRawPoint } from './geom';

export class PathData {
  private _commands: ImmutableCommandArray = [];

  get commands() {
    return this._commands;
  }

  constructor(d: string | undefined = undefined) {
    if (d !== undefined) {
      const parsedD = pathDToCommandArray(d);
      this.concatCommands(parsedD);
    }
  }

  pushCommand(command: Command) {
    validatePushCommand(this._commands, command);
    this._commands = produce(this._commands, (commands) => {
      commands.push(clone(command));
    });
  }

  concatCommands(appendCommands: Command[] | ImmutableCommandArray): PathData {
    this._commands = produce(this._commands, (commands) => {
      for (const command of appendCommands) {
        validatePushCommand(commands, command);
        commands.push(clone(command));
      }
    });

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
    const lastPos = getLastPosition(this.commands);
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

  popCommand(): Command | undefined {
    let item;
    this._commands = produce(this._commands, (draft) => {
      item = draft.pop();
    });
    return item;
  }

  private _assignCommands(commands: ImmutableCommandArray) {
    // TODO: is there a better way to allow mutation privately but prevent publicly
    // @ts-ignore
    this._commands = commands;
  }

  reversePath(): PathData {
    this._assignCommands(produce(this._commands, reversePathRecipe));
    return this;
  }

  concatPath(path: PathData): PathData {
    this.concatCommands(path.commands);
    return this;
  }

  transformByObject(transformObject: Partial<TransformObject>) {
    this._assignCommands(transformByObjectProducer(this._commands, transformObject));
    return this;
  }

  transformByMatrix(matrix: DOMMatrixReadOnly) {
    this._assignCommands(transformByMatrixProducer(this._commands, matrix));
    return this;
  }

  getD():string {
    return commandArrayToPathD(this._commands);
  }
}
