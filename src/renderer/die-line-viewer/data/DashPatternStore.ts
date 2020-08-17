import { computed, observable } from 'mobx';
import { dashPatterns } from './dash-patterns';
import {StrokeDashPathSpec} from '../util/shapes/strokeDashPath';

interface DashPatternDefs {
  [propName: string]: StrokeDashPathSpec,
}

export class DashPatternStore implements StrokeDashPathSpec {
  @observable
  public strokeDashPathPatternId: string;

  @observable
  public strokeDashLength: number;

  @observable
  public strokeDashOffsetRatio: number;

  constructor(strokeDashPathPatternId: string, strokeDashLength: number, strokeDashOffsetRatio: number) {
    this.strokeDashPathPatternId = strokeDashPathPatternId;
    this.strokeDashLength = strokeDashLength;
    this.strokeDashOffsetRatio = strokeDashOffsetRatio;
  }

  @computed
  get strokeDashPathPattern() {
    return dashPatterns[this.strokeDashPathPatternId];
  }
}
