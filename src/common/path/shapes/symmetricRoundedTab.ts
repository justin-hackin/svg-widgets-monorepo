import {
  distanceFromOrigin,
  hingedPlotByProjectionDistance,
  parallelLinePointsAtDistance,
  subtractPoints,
} from '../../util/geom';

export const arrowTabPlots = (
  tabBaseStart,
  tabBaseEnd,
  midpointDepthToTabDepth,
  tabDepthToBaseLength,
  tabWideningAngle,
) => {
  const vector = subtractPoints(tabBaseEnd, tabBaseStart);
  const tabDepth = tabDepthToBaseLength * distanceFromOrigin(vector);
  const tabApexes = parallelLinePointsAtDistance(tabBaseStart, tabBaseEnd, tabDepth);
  const midpointDepth = tabDepth * midpointDepthToTabDepth;

  const tabMidpoints = [
    hingedPlotByProjectionDistance(tabBaseEnd, tabBaseStart, tabWideningAngle, -midpointDepth),
    hingedPlotByProjectionDistance(tabBaseStart, tabBaseEnd, tabWideningAngle, midpointDepth),
  ];

  return {
    tabMidpoints,
    tabApexes,
  };
};
