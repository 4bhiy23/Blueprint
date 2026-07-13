import repoConfig from "@repo/eslint-config";

export default [
  ...repoConfig,
  {
    ignores: [".next/**", "node_modules/**"],
  },
];
