import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  reactCompiler: !isDevelopment,
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
