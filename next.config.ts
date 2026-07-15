import type { NextConfig } from "next";

// O host do Storage sai do próprio SUPABASE_URL: fixá-lo aqui quebraria o
// next/image em qualquer outro projeto Supabase (outro ambiente, outro ref).
const supabaseHost = process.env.SUPABASE_URL
  ? new URL(process.env.SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Fotos de perfil enviadas pelas nutricionistas (bucket `avatars`).
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
