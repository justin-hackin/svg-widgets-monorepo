interface PathPatternInfo {
  isPath: true,
  svgString: string,
  sourceFileName: string,
}

interface ImagePatternInfo {
  // TODO: consider this could be inferred from pattern
  isPath: false,
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

export interface ParsedFilePathData {
  path: string,
  extname: string,
  basename: string,
  dirname: string,
}

export interface TxtFileInfo {
  fileString: string,
  filePath: string,
}
