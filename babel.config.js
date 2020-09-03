module.exports = {
  presets: [
    [
      "@vue/app",
      {
        // 编译库文件时，建议不添加polyfill
        useBuiltIns: false
      }
    ]
  ]
};
