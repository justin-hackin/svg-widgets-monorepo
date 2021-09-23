export const circularSlice = (array, start, elements) => {
  const slice = [];
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

export interface dimensions {width: number, height: number}

export const resolveImageDimensionsFromBase64 = (base64): Promise<dimensions> => (
  new Promise((resolve) => {
    const img = new Image();
    // @ts-ignore
    img.onload = ({ target: { width, height } }) => {
      resolve({ width, height });
    };
    img.src = base64;
  }));
