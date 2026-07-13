import repoConfig from "@repo/eslint-config";

export default [
  ...repoConfig,
  {
    ignores: ["node_modules/**", "dist/**"],
  },
];
