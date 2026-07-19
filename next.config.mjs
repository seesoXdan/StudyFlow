/** @type {import('next').NextConfig} */

// GitHub Pages serves a project site under /<repo>. Set NEXT_PUBLIC_BASE_PATH
// to "/StudyFlow" (or your repo name) in the deploy workflow. Leave empty for
// local dev or a custom domain / <user>.github.io root repo.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  // Static HTML export so the app can be hosted on GitHub Pages (no server).
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    // GitHub Pages has no image optimization server.
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
