import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  // The site is served under a locale prefix; bare "/" goes to the default.
  redirects: async () => [
    { source: "/", destination: "/uk", permanent: false },
  ],
  images: {
    localPatterns: [
      // Files uploaded through the CMS.
      { pathname: "/api/media/file/**" },
      // Assets shipped in /public, e.g. the bundled logo fallback.
      { pathname: "/*" },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };

    return webpackConfig;
  },
  turbopack: {
    root: path.resolve(dirname),
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
