import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "store.storeimages.cdn-apple.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.samsung.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.dell.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "p1-ofp.static.pub",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "store.google.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.lenovo.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.hp.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.apple.com",
      },
      {
        protocol: "https",
        hostname: "**.amazon.com",
      },
      {
        protocol: "https",
        hostname: "**.bestbuy.com",
      },
      {
        protocol: "https",
        hostname: "**.samsung.com",
      },
      {
        protocol: "https",
        hostname: "**.newegg.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.dell.com",
      },
    ],
  },
};

export default nextConfig;
