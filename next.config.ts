import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  transpilePackages: ["tinymce", "@tinymce/tinymce-react"],
};

export default nextConfig;
