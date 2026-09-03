/** @type {import('next').NextConfig} */
const nextConfig = {
  // El piloto prioriza que el build nunca se rompa por un aviso de lint.
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
