import { PlainObjectType } from '../types';
export interface BaseOptions {
    apply: boolean;
    name: string;
}
export declare type StrokeWidthOptions = BaseOptions & {
    nonScaling: boolean;
    customVars?: PlainObjectType;
};
export declare type ColorOptions = BaseOptions & {
    preserveOriginal: boolean;
    customVars?: PlainObjectType;
};
export declare type TransitionOptions = BaseOptions & {
    default?: string;
};
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
