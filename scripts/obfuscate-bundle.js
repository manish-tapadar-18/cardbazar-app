const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');

const bundlePath = process.argv[2];
const bundle = fs.readFileSync(bundlePath, 'utf8');

const obfuscatedBundle = JavaScriptObfuscator.obfuscate(bundle, {
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,

  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,

  stringArray: true,
  stringArrayEncoding: ['base64', 'rc4'],
  stringArrayThreshold: 0.75,

  identifierNamesGenerator: 'hexadecimal',

  selfDefending: true,

  disableConsoleOutput: true,

  debugProtection: true,
  debugProtectionInterval: 2000,
}).getObfuscatedCode();

fs.writeFileSync(bundlePath, obfuscatedBundle);
console.log('Bundle obfuscated successfully');
