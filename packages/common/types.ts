interface PathPatternInfo {
  isPath: true,
  svgString: string,
  sourceFileName: string,
}

interface ImagePatternInfo {
  isPath: false,
  // TODO: this could be flattened now that it's not being used as a snapshotIn (post-MST)
  pattern: {
    imageData: string,
    dimensions: {
      width: number, height: number,
    },
    sourceFileName: string,
  }
}

export type PatternInfo = PathPatternInfo | ImagePatternInfo;

export interface dialogOpenJsonRes {
  fileData: object,
  filePath: string,
}

export interface dialogOpenSvgRes {
  fileString: string,
  filePath: string,
}
