module.exports = {
  // ...其他設定
  transformIgnorePatterns: [
    "/node_modules/(?!(undici)/)", // 這會轉換除了 undici 之外的所有 node_modules
  ],
  // 或者更精確地只包含 undici
  // transformIgnorePatterns: [
  //   "/node_modules/(?!undici/)",
  // ],
};
