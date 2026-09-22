/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  "root": true,
  "extends": [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-typescript/recommended",
    // "@vue/eslint-config-prettier"
  ],
  "env": {
    "vue/setup-compiler-macros": true
  },
  "overrides": [
    /**
     * Turn off eslint's default "no-undef" 'cause we're using Typescript.
     * The checks it provides are already handled by Typescript, and then some.
     *
     * @see https://github.com/typescript-eslint/typescript-eslint/blob/13583e65f5973da2a7ae8384493c5e00014db51b/docs/linting/TROUBLESHOOTING.md#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
     */
    {
      "files": [ "*.vue" ],
      "rules": { "no-undef": "off" }
    }
  ]
}
