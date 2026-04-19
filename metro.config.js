// const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
// const baseJSBundle = require('metro/src/DeltaBundler/Serializers/baseJSBundle').default;
// const bundleToString = require('metro/src/lib/bundleToString').default;

// // ─── Metro Bundler Minification ───────────────────────────────────────────────
// // Terser provides the base minification layer: dead-console stripping,
// // variable mangling, and debugger removal. Always active for --dev false builds.
// const minificationConfig = {
//   transformer: {
//     minifierPath: 'metro-minify-terser',
//     minifierConfig: {
//       compress: {
//         drop_console: true,
//         drop_debugger: true,
//         pure_funcs: ['console.log', 'console.info', 'console.debug'],
//       },
//       mangle: {
//         toplevel: true,
//       },
//     },
//   },
// };

// // ─── JavaScript Obfuscator Integration ───────────────────────────────────────
// // Applied on top of terser minification for Android production bundles only.
// // Hooks into Metro's serializer so obfuscation runs BEFORE Hermes bytecode
// // compilation — meaning the final APK contains Hermes-compiled obfuscated code.
// //
// // Hermes-safe options:
// //   - selfDefending/debugProtection OFF: use Function.toString() patterns
// //     that Hermes evaluates differently, causing runtime crashes
// //   - stringArrayEncoding 'base64' only: 'rc4' encoding relies on eval()
// //     which Hermes rejects in strict mode
// //   - renameGlobals/renameProperties OFF: React Native bridge depends on
// //     known global and property names (AppRegistry, NativeModules, etc.)
// const OBFUSCATION_OPTIONS = {
//   compact: true,
//   target: 'node',

//   // Identifier & structural obfuscation
//   identifierNamesGenerator: 'hexadecimal',
//   renameGlobals: false,
//   renameProperties: false,
//   transformObjectKeys: false,
//   simplify: true,
//   numbersToExpressions: true,

//   // Control flow (moderate threshold to balance protection vs. APK size)
//   controlFlowFlattening: true,
//   controlFlowFlatteningThreshold: 0.75,

//   // Dead code injection adds noise to confuse analysis
//   deadCodeInjection: true,
//   deadCodeInjectionThreshold: 0.4,

//   // String protection — base64 only (rc4 uses eval, unsafe for Hermes)
//   stringArray: true,
//   stringArrayEncoding: ['base64'],
//   stringArrayThreshold: 0.75,
//   stringArrayRotate: true,
//   stringArrayShuffle: true,
//   stringArrayIndexShift: true,
//   stringArrayCallsTransform: true,
//   stringArrayCallsTransformThreshold: 0.5,
//   stringArrayWrappersCount: 2,
//   stringArrayWrappersChunkLength: 10,
//   stringArrayWrappersParametersMaxCount: 4,
//   stringArrayWrappersType: 'function',
//   splitStrings: true,
//   splitStringsChunkLength: 10,

//   // Anti-debug — disabled: Hermes handles Function.toString() differently
//   selfDefending: false,
//   debugProtection: false,
//   debugProtectionInterval: 0,

//   disableConsoleOutput: true,
//   log: false,
//   unicodeEscapeSequence: false,
// };

// function androidReleaseSerializer(entryPoint, preModules, graph, options) {
//   const bundle = baseJSBundle(entryPoint, preModules, graph, options);
//   const { code } = bundleToString(bundle);

//   if (!options.dev && options.platform === 'android') {
//     const JavaScriptObfuscator = require('javascript-obfuscator');
//     console.log('\n[Obfuscator] Obfuscating Android JS bundle...');
//     const result = JavaScriptObfuscator.obfuscate(code, OBFUSCATION_OPTIONS);
//     console.log('[Obfuscator] Done.\n');
//     return result.getObfuscatedCode();
//   }

//   return code;
// }

// const obfuscatorConfig = {
//   serializer: {
//     customSerializer: androidReleaseSerializer,
//   },
// };

// module.exports = mergeConfig(
//   getDefaultConfig(__dirname),
//   minificationConfig,
//   obfuscatorConfig,
// );


const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
    transformer: {
        minifierPath: 'metro-minify-terser',
        minifierConfig: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
            },
            mangle: {
                toplevel: true,
            },
        },
    },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

