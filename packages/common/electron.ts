import { electronApiType } from './electronApi';

// @ts-ignore
export const electronApi = window.electron as Readonly<electronApiType>;
