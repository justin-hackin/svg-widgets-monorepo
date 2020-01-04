import sortedIndex from 'lodash-es/sortedIndex';
import flatten from 'lodash-es/flatten';
import last from 'lodash-es/last';
import cloneDeep from 'lodash-es/cloneDeep';

const validateRange = (rangeSeries) => {
  const errorMsg = (index, item) => `Invalid range set, index: ${index}, value: ${item}`;
  for (let index = 0; index < rangeSeries.length; index += 1) {
    const range = rangeSeries[index];
    if (range[0] >= range[1]) {
      // eslint-disable-next-line no-console
      console.dir(rangeSeries);
      throw new Error(errorMsg(index, range));
    }
    // @ts-ignore
    if (index && range[0] <= rangeSeries[index - 1][1]) {
      // eslint-disable-next-line no-console
      console.dir(rangeSeries);
      throw new Error(errorMsg(index, range));
    }

    // @ts-ignore
    if (index !== rangeSeries.length - 1 && range[1] >= rangeSeries[index + 1]) {
      // eslint-disable-next-line no-console
      console.dir(rangeSeries);
      throw new Error(errorMsg(index, range));
    }
  }
};

const getPositionInRangeSeries = (rangeSeries, number) => sortedIndex(flatten(rangeSeries), number);

export const subtractRangeSet = (baseSet, subtractSet) => {
  validateRange(baseSet);
  validateRange(subtractSet);
  if (subtractSet[0][0] >= last(baseSet)[1] || last(subtractSet)[1] <= baseSet[0][0]) {
    return baseSet;
  }
  const endIndex = baseSet.length * 2;
  const returnValue = cloneDeep(baseSet);

  // reverse list to preserve index sync with return value
  for (const subtractRange of subtractSet) {
    const startPos = getPositionInRangeSeries(returnValue, subtractRange[0]);
    const endPos = getPositionInRangeSeries(returnValue, subtractRange[1]);

    if ((startPos === 0 && endPos === 0) || (startPos === endIndex && endPos === endIndex)) {
      continue;
    }

    // tricky, one interval must be split into 2
    if (startPos === endPos) {
      // otherwise you are punching out an existing hole
      if (startPos % 2 === 1) {
        const intersectIndex = (startPos - 1) / 2;
        const intersectedRange = returnValue[intersectIndex];
        returnValue.splice(
          intersectIndex, 1,
          [intersectedRange[0], subtractRange[0]],
          [subtractRange[1], intersectedRange[1]],
        );
      }
    } else {
      // in the "*Pos % 2 === 1" blocks, there will be a no-op if
      // odd index means falling within one of the ranges
      if (startPos % 2 === 1) {
        // eslint-disable-next-line prefer-destructuring
        returnValue[(startPos - 1) / 2][1] = subtractRange[0];
      }

      if (endPos % 2 === 1) {
        // eslint-disable-next-line prefer-destructuring
        returnValue[(endPos - 1) / 2][0] = subtractRange[1];
      }
      // are there any intervals that need to be deleted wholly?
      const deleteStart = Math.ceil(startPos / 2);
      const deleteEnd = Math.floor(endPos / 2);
      if (deleteStart !== deleteEnd) {
        returnValue.splice(deleteStart, deleteEnd - deleteStart);
      }
    }
  }
  return returnValue;
};