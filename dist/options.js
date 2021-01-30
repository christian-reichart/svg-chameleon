"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptionsFromConfigFile = exports.getDefaultOptions = void 0;
const find_up_1 = __importDefault(require("find-up"));
const chalk_1 = __importDefault(require("chalk"));
const util_1 = require("./util");
const configFileNames = ['chameleon.config.js', 'chameleon.config.json'];
/**
 * Get default options
 * Return a new instance to prevent possible mutabillity issues
 */
exports.getDefaultOptions = () => ({
    path: '',
    subdirName: 'chameleon-sprite',
    fileName: 'chameleon-sprite',
    css: false,
    scss: false,
    colors: {
        apply: true,
        name: 'svg-custom-color',
        preserveOriginal: true,
    },
    strokeWidths: {
        apply: true,
        name: 'svg-custom-stroke-width',
        nonScaling: false,
    },
    transition: {
        apply: false,
        name: 'svg-custom-transition',
        default: undefined,
    },
});
/**
 * Get config path
 *
 * @param { string | undefined } path
 */
const getConfigPath = (path) => __awaiter(void 0, void 0, void 0, function* () {
    return path !== undefined ? util_1.getAbsolutePath(path) : yield find_up_1.default(configFileNames);
});
/**
 * Get options from config file
 *
 * @param { string | undefined } path
 */
exports.getOptionsFromConfigFile = (path) => __awaiter(void 0, void 0, void 0, function* () {
    const configPath = yield getConfigPath(path);
    try {
        if (configPath) {
            console.log(chalk_1.default.grey(`Found config file under '${configPath}.'`));
        }
        return configPath !== undefined ? require(configPath) : {};
    }
    catch (error) {
        throw new Error(`There was a problem loading your config file. ` + error);
    }
});
//# sourceMappingURL=options.js.map