import { intersectLineLine, parallelLinePointsAtDistance, symmetricHingePlot } from '../geom';
import { roundedEdgePath } from './generic';

const ARBITRARY_LENGTH = 10;
export const symmetricRoundedTab = (
  tabBaseStart, tabBaseEnd, midpointDepthToTabDepth, tabDepthToBaseLength, tabRoundingDistanceRatio, tabWideningAngle,
) => {
  const vector = tabBaseEnd.subtract(tabBaseStart);
  const tabDepth = tabDepthToBaseLength * vector.length;
  const [tabApexStart, tabApexEnd] = parallelLinePointsAtDistance(tabBaseStart, tabBaseEnd, tabDepth);
  const midpointDepth = tabDepth * midpointDepthToTabDepth;
  const [tabMidIntersectorStart, tabMidIntersectorEnd] = parallelLinePointsAtDistance(
    tabBaseStart, tabBaseEnd, midpointDepth,
  );
  const [tabStartDeparture, tabEndDeparture] = symmetricHingePlot(
    tabBaseStart, tabBaseEnd, Math.PI / 2 + tabWideningAngle, ARBITRARY_LENGTH,
  );
  const tabMidpointStart = intersectLineLine(
    tabMidIntersectorStart, tabMidIntersectorEnd, tabBaseStart, tabStartDeparture,
  );
  const tabMidpointEnd = intersectLineLine(
    tabMidIntersectorStart, tabMidIntersectorEnd, tabBaseEnd, tabEndDeparture,
  );

  // don't let the retraction happen any more than half the length of shortest the non-rounded edge
  // otherwise the control points may criss-cross causing odd loops
  const tabRoundingDistance = tabRoundingDistanceRatio * 0.5 * Math.min(
    tabBaseStart.subtract(tabMidpointStart).length,
    tabMidpointStart.subtract(tabApexStart).length,
  );
  return {
    points: {
      center: [tabMidpointStart, tabMidpointEnd],
      apex: [tabApexStart, tabApexEnd],
    },
    tabRoundingDistance,
    path: roundedEdgePath(
      [tabBaseStart, tabMidpointStart, tabApexStart, tabApexEnd, tabMidpointEnd, tabBaseEnd],
      tabRoundingDistance,
    ),
  };
};
