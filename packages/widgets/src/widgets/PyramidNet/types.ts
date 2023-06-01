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

export enum PRINT_REGISTRATION_TYPES {
  LASER_CUTTER = 'laser-cutter',
  GRAPHTEC_OPTICAL = 'graphtec-optical',
  NONE = 'none',
}
