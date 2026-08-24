import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  assetPrefix: isGitHubPages ? "/digital-relics" : undefined,
  trailingSlash: false,
};

export default nextConfig;
