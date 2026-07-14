import globals from "globals";
import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";


/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ["dist/**", "build/**", "node_modules/**", "coverage/**"]
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: globals.browser
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn"
    },
  },
  pluginReact.configs.flat.recommended,
  {
    rules: {
      "react/prop-types": "off"
    }
  }
];