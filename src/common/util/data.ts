export const circularSlice = <T>(array: T[], start: number, elements: number):T[] => {
  const slice: T[] = [];
  for (let i = 0; i < elements; i += 1) {
    slice.push(array[(start + i) % array.length]);
  }
  return slice;
};

export const toBase64 = (file): Promise<string> => (new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = (error) => reject(error);
}));

export interface Dimensions {width: number, height: number}

export const resolveImageDimensionsFromBase64 = (base64): Promise<Dimensions> => (
  new Promise((resolve) => {
    const img = new Image();
    img.onload = ({ target }) => {
      const { width, height } = target as HTMLImageElement;
      resolve({ width, height });
    };
    img.src = base64;
  }));
export const stringifier = (option) => (`${option}`);
export const filePathConstructor = (
  fileBaseName: string,
  assetName: string | undefined,
  copies: number | undefined,
) => `${fileBaseName}${assetName ? `__${assetName}` : ''}${copies ? `__X${copies}` : ''}.svg`;
