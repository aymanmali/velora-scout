const isGithubPages = process.env.GITHUB_PAGES === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isGithubPages
    ? {
        output: "export",
        basePath: "/velora-scout",
        assetPrefix: "/velora-scout/",
      }
    : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
