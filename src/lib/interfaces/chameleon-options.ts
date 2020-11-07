import { PlainObjectType } from '../types';

export interface BaseOptions {
    apply: boolean;
    name: string;
}

export interface StrokeWidthOptions extends BaseOptions {
    nonScaling: boolean;
    customVars?: PlainObjectType;
}
export interface ColorOptions extends BaseOptions {
    preserveOriginal: boolean;
    customVars?: PlainObjectType;
}

export interface TransitionOptions extends BaseOptions {
    default: any;
}

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

