module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", "dev-dist", "node_modules", "*.cjs", "scripts"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    // `catch {}` fallbacks around wake lock / vibration are intentional.
    "no-empty": ["error", { allowEmptyCatch: true }],
  },
};
