import { PlainObjectType } from '../types';

export interface BaseOptions {
    apply: boolean;
    name: string;
}

export type StrokeWidthOptions = BaseOptions & {
    nonScaling: boolean;
    customVars?: PlainObjectType;
}

export type ColorOptions = BaseOptions & {
    preserveOriginal: boolean;
    customVars?: PlainObjectType;
}

export type TransitionOptions = BaseOptions & {
    default: null;
}

// @Todo(phil): make only path required in create method
export interface ChameleonOptions {
    path: string;
    subdirName: string;
    fileName: string;
    css: boolean;
    scss: boolean;
    colors: ColorOptions;
    strokeWidths: StrokeWidthOptions;
    transition: TransitionOptions;
}

