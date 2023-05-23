import { pointsAreEqual } from '@/common/util/geom';
import {
  DestinationCommand, getCurrentSegmentStart, getLastPosition, PathData,
} from '@/common/PathData';

/**
 * often constructing complicated paths is simplified by defining
 * paths via helper functions whose start and end points overlap
 * this can be used to combine those paths while ensuring they fit together
 */
export function appendContinuationPath(
  basePath: PathData,
  path: PathData,
  closesPath = false,
  marginOfError = undefined,
) {
  if (basePath.commands.length) {
    const baseLastPosition = getLastPosition(basePath.commands);
    if (!pointsAreEqual(baseLastPosition, (path.commands[0] as DestinationCommand).to, marginOfError)) {
      throw new Error('invalid use of weldPath: first parameter path must'
        + ' start at the same position as the end of path instance end position');
    }
    if (closesPath && !pointsAreEqual(getLastPosition(path.commands), getCurrentSegmentStart(basePath.commands))) {
      throw new Error('invalid use of weldPath: when using closesPath option, instance\'s currentSegementStart '
        + 'must be equal to the last command of first parameter path\'s lastPosition');
    }
  }
  basePath.concatCommands(path.commands.slice(1, closesPath ? -1 : undefined));
  if (closesPath) {
    basePath.close();
  }
}
