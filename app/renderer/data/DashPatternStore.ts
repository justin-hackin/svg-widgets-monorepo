import { computed } from 'mobx';
import { StrokeDashPathSpec } from '../util/shapes';
import { dashPatterns } from './dash-patterns';

interface DashPatternDefs {
  [propName: string]: StrokeDashPathSpec,
}

export class DashPatternStore implements StrokeDashPathSpec {
  public strokeDashPathPatternId: string;

  public strokeDashLength: number;

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
