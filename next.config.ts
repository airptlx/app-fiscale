import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// Webpack (not Turbopack) is used deliberately for dev/build — see docs/decisions/0004-webpack-plutot-que-turbopack.md
process.env.SERWIST_SUPPRESS_TURBOPACK_WARNING = "1";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSerwist(nextConfig);
