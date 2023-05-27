import { Dimensions } from 'svg-widget-studio';

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

export const resolveImageDimensionsFromBase64 = (base64): Promise<Dimensions> => (
  new Promise((resolve) => {
    const img = new Image();
    img.onload = ({ target }) => {
      const { width, height } = target as HTMLImageElement;
      resolve({ width, height });
    };
    img.src = base64;
  }));
