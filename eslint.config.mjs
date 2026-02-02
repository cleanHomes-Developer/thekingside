import nextVitalsPkg from "eslint-config-next/core-web-vitals.js";
import nextTsPkg from "eslint-config-next/typescript.js";
const nextVitals = nextVitalsPkg?.default ?? nextVitalsPkg;
const nextTs = nextTsPkg?.default ?? nextTsPkg;

const extendsList = [
  ...(Array.isArray(nextVitals.extends) ? nextVitals.extends : []),
  ...(Array.isArray(nextTs.extends) ? nextTs.extends : []),
];

const eslintConfig = {
  extends: extendsList,
  ignorePatterns: [".next/**", "out/**", "build/**", "next-env.d.ts"],
};

export default eslintConfig;
