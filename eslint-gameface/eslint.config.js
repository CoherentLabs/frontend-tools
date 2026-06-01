import gameface from "eslint-plugin-gameface";

export default [
  {
    ignores: ["**/node_modules/**"],
  },
  ...gameface.configs["flat/recommended"],
  {
    settings: {
      gameface: {
        version: "3.0.0.1"
      }
    },
    files: ["examples/**/*"],
    rules: {
      "css/use-baseline": "off",
    },
  },
];
