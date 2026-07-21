import globals from "globals";
import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import unusedImports from "eslint-plugin-unused-imports";


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
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_"
        }
      ],
      "no-undef": "error"
    },
    plugins: {
      "unused-imports": unusedImports
    }
  },
  pluginReact.configs.flat.recommended,
  {
    rules: {
      "react/prop-types": "off"
    }
  }
];