import { Command, Coord, ImmutableCommandArray } from '@/common/PathData/types';
import {
  clone, commandFactory, composeSVG, parseSVG,
} from '@/common/PathData/helpers';
import { validatePushCommand } from '@/common/PathData/validation';
import { produce } from 'immer';
import { Producer } from 'immer/src/types/types-external';
import { transformProducer } from '@/common/PathData/producers';
import { TransformObject } from 'svg-path-commander';

export class PathData {
  private _commands: ImmutableCommandArray = [];

  get commands() {
    return this._commands;
  }

  constructor(d?: string) {
    if (d) {
      const parsedD = parseSVG(d);
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

  concatCommands(commands: Command[]): PathData {
    for (const command of commands) {
      this.pushCommand(command);
    }
    return this;
  }

  move(to: Coord): PathData {
    this.pushCommand(commandFactory.M(to));
    return this;
  }

  line(to: Coord): PathData {
    this.pushCommand(commandFactory.L(to));
    return this;
  }

  close(): PathData {
    this.pushCommand(commandFactory.Z());
    return this;
  }

  cubicBezier(ctrl1: Coord, ctrl2: Coord, to: Coord): PathData {
    this.pushCommand(commandFactory.C(ctrl1, ctrl2, to));
    return this;
  }

  smoothCubicBezier(ctrl2: Coord, to: Coord): PathData {
    this.pushCommand(commandFactory.S(ctrl2, to));
    return this;
  }

  quadraticBezier(ctrl1: Coord, to: Coord): PathData {
    this.pushCommand(commandFactory.Q(ctrl1, to));
    return this;
  }

  smoothQuadraticBezier(to: Coord): PathData {
    this.pushCommand(commandFactory.T(to));
    return this;
  }

  ellipticalArc(
    radiusX: number,
    radiusY: number,
    xAxisRotation: number,
    largeArcFlag: boolean,
    sweepFlag: boolean,
    to: Coord,
  ): PathData {
    this.pushCommand(commandFactory.A(radiusX, radiusY, xAxisRotation, largeArcFlag, sweepFlag, to));
    return this;
  }

  clone() {
    return (new PathData()).concatPath(this);
  }

  dangerouslyProduceCommands(produceFn: Producer<ImmutableCommandArray>) {
    this._commands = produce(this._commands, produceFn);
  }

  concatPath(path): PathData {
    this.concatCommands(path.commands);
    return this;
  }

  transform(matrix: Partial<TransformObject>) {
    this._commands = transformProducer(this._commands, matrix);
    return this;
  }

  getD():string {
    return composeSVG(this._commands);
  }
}
