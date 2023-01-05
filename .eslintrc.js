module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    jest: true,
  },
  extends: [
    "airbnb-base",
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    quotes: ["error", "double"],
    curly: ["error", "all"],
    "no-console": ["error", { allow: ["info", "warn", "error"] }],
    "no-use-before-define": ["error", { functions: false, classes: false }],
    "brace-style": ["error", "1tbs", { allowSingleLine: false }],
  },
};
