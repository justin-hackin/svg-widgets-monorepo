import {
  getLineLineIntersection,
  parallelLinePointsAtDistance,
  symmetricHingePlot,
  hingedPlotByProjectionDistance,
  distanceFromOrigin, subtractPoints,
} from '../../../common/util/geom';
import { connectedLineSegments, roundedEdgePath } from './generic';
import { PathData } from '../PathData';
import { strokeDashPath } from './strokeDashPath';

const ARBITRARY_LENGTH = 10;
export const symmetricRoundedTab = (
  tabBaseStart, tabBaseEnd, midpointDepthToTabDepth, tabDepthToBaseLength, tabRoundingDistanceRatio, tabWideningAngle,
) => {
  const vector = subtractPoints(tabBaseStart, tabBaseEnd);
  const tabDepth = tabDepthToBaseLength * distanceFromOrigin(vector);
  const [tabApexStart, tabApexEnd] = parallelLinePointsAtDistance(tabBaseStart, tabBaseEnd, tabDepth);
  const midpointDepth = tabDepth * midpointDepthToTabDepth;
  const [tabMidIntersectorStart, tabMidIntersectorEnd] = parallelLinePointsAtDistance(
    tabBaseStart, tabBaseEnd, midpointDepth,
  );
  const [tabStartDeparture, tabEndDeparture] = symmetricHingePlot(
    tabBaseStart, tabBaseEnd, Math.PI / 2 + tabWideningAngle, ARBITRARY_LENGTH,
  );
  const tabMidpointStart = getLineLineIntersection(
    tabMidIntersectorStart, tabMidIntersectorEnd, tabBaseStart, tabStartDeparture,
  );
  const tabMidpointEnd = getLineLineIntersection(
    tabMidIntersectorStart, tabMidIntersectorEnd, tabBaseEnd, tabEndDeparture,
  );

  // don't let the retraction happen any more than half the length of shortest the non-rounded edge
  // otherwise the control points may criss-cross causing odd loops
  return {
    points: {
      center: [tabMidpointStart, tabMidpointEnd],
      apex: [tabApexStart, tabApexEnd],
    },
    path: roundedEdgePath(
      [tabBaseStart, tabMidpointStart, tabApexStart, tabApexEnd, tabMidpointEnd, tabBaseEnd],
      tabRoundingDistanceRatio,
    ),
  };
};

export const arrowTab = (
  tabBaseStart, tabBaseEnd, midpointDepthToTabDepth, tabDepthToBaseLength, tabWideningAngle, scoreDashSpec,
) => {
  const vector = subtractPoints(tabBaseEnd, tabBaseStart);
  const tabDepth = tabDepthToBaseLength * distanceFromOrigin(vector);
  const tabApexes = parallelLinePointsAtDistance(tabBaseStart, tabBaseEnd, tabDepth);
  const midpointDepth = tabDepth * midpointDepthToTabDepth;

  const tabMidpoints = [
    hingedPlotByProjectionDistance(
      tabBaseEnd, tabBaseStart, tabWideningAngle, -midpointDepth,
    ),
    hingedPlotByProjectionDistance(
      tabBaseStart, tabBaseEnd, tabWideningAngle, midpointDepth,
    ),
  ];

  const scorePath = new PathData();
  scorePath.concatPath(strokeDashPath(tabBaseStart, tabBaseEnd, scoreDashSpec));
  scorePath.concatPath(strokeDashPath(tabMidpoints[0], tabMidpoints[1], scoreDashSpec));

  return {
    cutPath: connectedLineSegments(
      [tabBaseStart, tabMidpoints[0], tabApexes[0], tabApexes[1], tabMidpoints[1], tabBaseEnd],
    ),
    scorePath,
  };
};
