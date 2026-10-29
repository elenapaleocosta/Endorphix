const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// inlineRem: 16 keeps rem-based sizes identical on native and web (NativeWind defaults to 14 on native).
module.exports = withNativeWind(config, { input: "./global.css", inlineRem: 16 });
