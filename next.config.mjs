const isGithubPages = process.env.GITHUB_PAGES === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isGithubPages
    ? {
        output: "export",
        basePath: "/aura-deals",
        assetPrefix: "/aura-deals/",
      }
    : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
