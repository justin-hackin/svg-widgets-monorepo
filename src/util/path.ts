import cloneDeep from 'lodash-es/cloneDeep';
import includes from 'lodash-es/includes';
import isArray from 'lodash-es/isArray';
import isNumber from 'lodash-es/isNumber';
import isNaN from 'lodash-es/isNaN';
import { composeSVG, makeAbsolute, parseSVG } from 'svg-path-parser';
import { hingedPlot } from './geom';

const castToArray = (pt) => {
  if (isNumber(pt.x) && isNumber(pt.y)) {
    const arrPt = [pt.x, pt.y];
    if (isNaN(pt.x) || isNaN(pt.y)) {
      throw new Error(`point co-ordinates contain NaN: (${arrPt})`);
    }
    return arrPt;
  }
  return pt;
};

export const COMMAND_FACTORY = {
  M: (to) => ({
    code: 'M',
    to: castToArray(to),
  }),
  L: (to) => ({
    code: 'L',
    to: castToArray(to),
  }),
  C: (ctrl1, ctrl2, to) => ({
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
  Q: (ctrl1, to) => ({
    code: 'Q',
    to: castToArray(to),
    ctrl1: castToArray(ctrl1),
  }),
  T: (to) => ({
    code: 'T',
    to: castToArray(to),
  }),
  A: (radiusX, radiusY, sweepFlag, largeArcFlag, to) => ({
    code: 'A',
    radius: [radiusX, radiusY],
    flags: [sweepFlag, largeArcFlag],
    to: castToArray(to),
  }),
  Z: () => ({
    code: 'Z',
  }),
};

export class PathData {
  constructor(param) {
    // TODO: check instance type
    if (param) {
      if (!isArray(param)) {
        throw new Error(
          'PathData constructor: optional parameter must be an array of command objects',
        );
      }
    }
    this.commands = param || [];
  }

  move(to) {
    const command = COMMAND_FACTORY.M(to);
    this.commands.push(command);
    return this;
  }

  line(to) {
    const command = COMMAND_FACTORY.L(to);
    this.commands.push(command);
    return this;
  }

  close() {
    const command = COMMAND_FACTORY.Z();
    this.commands.push(command);
    return this;
  }

  cubicBezier(ctrl1, ctrl2, to) {
    const command = COMMAND_FACTORY.C(ctrl1, ctrl2, to);
    this.commands.push(command);
    return this;
  }

  quadraticBezier(ctrl1, to) {
    const command = COMMAND_FACTORY.Q(ctrl1, to);
    this.commands.push(command);
    return this;
  }

  smoothQuadraticBezier(to) {
    const command = COMMAND_FACTORY.T(to);
    this.commands.push(command);
    return this;
  }

  elipticalArc(to, radiusX, radiusY, sweepFlag, largeArcFlag) {
    const command = COMMAND_FACTORY.A(radiusX, radiusY, sweepFlag, largeArcFlag, to);
    this.commands.push(command);
    return this;
  }

  static fromDValue(d) {
    return new PathData(makeAbsolute(parseSVG(d)));
  }

  getInferredControlPoint(index) {
    const { code } = this.commands[index];
    const previousCode = this.commands[index - 1].code;
    if (includes(['S', 'T'], code)) {
      throw new Error(`command at index ${index} is not a smooth bezier command`);
    }
    if (code === 'S') {
      const { ctrl2, to } = this.commands[index - 1];
      if (!includes(['S', 'C'], to)) {
        throw new Error(`svg path command ${code} is preceded by something other than 'S', 'C' command`);
      }
      const previousCtrl = previousCode === 'C' ? ctrl2 : this.getInferredControlPoint(index - 1);
      return hingedPlot(previousCtrl, to, Math.PI, to.subtract(previousCtrl).length);
    }
    if (code === 'T') {
      const { ctrl1, to } = this.commands[index - 1];
      if (!includes(['T', 'Q'], to)) {
        throw new Error(`svg path command ${code} is preceded by something other than 'T', 'Q' command`);
      }
      const previousCtrl = previousCode === 'Q' ? ctrl1 : this.getInferredControlPoint(index - 1);
      return hingedPlot(previousCtrl, to, Math.PI, to.subtract(previousCtrl).length);
    }
    throw new Error(`attempt to getInferredControlPoint, expected code at index ${index
    } to be one of 'S', 'T', but instead saw '${code}'`);
  }

  concatCommands(commands) {
    this.commands = this.commands.concat(cloneDeep(commands));
    return this;
  }

  concatPath(path) {
    this.commands = this.commands.concat(cloneDeep(path.commands));
    return this;
  }

  sliceCommandsDangerously(...params) {
    this.commands = this.commands.slice(...params);
    return this;
  }

  getD() {
    return composeSVG(this.commands);
  }
}
