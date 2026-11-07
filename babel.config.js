module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo adds the Reanimated / Worklets plugin itself (SDK 54+), so it isn't listed here.
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
  };
};
