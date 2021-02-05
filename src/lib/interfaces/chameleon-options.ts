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
    default?: string;
}

export type StylesOptions = {
    create: boolean,
    dest?: string,
    name?: string,
}

export type DimensionStylesOptions = {
    css: StylesOptions,
    scss: StylesOptions,
}

export interface ChameleonOptions {
    path: string;
    dest: string;
    name: string;
    dimensionStyles: DimensionStylesOptions,
    colors: ColorOptions;
    strokeWidths: StrokeWidthOptions;
    transition: TransitionOptions;
}

