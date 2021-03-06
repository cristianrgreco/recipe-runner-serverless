module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2018,
  },
  env: {
    node: true,
    es6: true,
  },
  extends: ["prettier", "eslint:recommended"],
  overrides: [
    {
      files: ["jest.setup.js", "src/**/*.test.js"],
      env: {
        jest: true,
      },
    },
  ],
};
