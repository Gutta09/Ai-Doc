/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse (and its pdfjs-dist dependency) must run as native Node modules
  // in server code rather than being bundled by webpack.
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "pdfjs-dist"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "gravatar.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

module.exports = nextConfig;
