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
  /**
   * El espacio del colaborador se mudó de /acceso a la RAÍZ. Estos redirects
   * mantienen vivos los enlaces ya repartidos (correo de Talento Humano,
   * comprobantes guardados, QR impresos). Son permanentes: la ruta vieja no
   * vuelve.
   */
  async redirects() {
    return [
      { source: "/acceso", destination: "/", permanent: true },
      { source: "/acceso/inicio", destination: "/inicio", permanent: true },
      {
        source: "/acceso/beneficiario/:ruta*",
        destination: "/beneficiario/:ruta*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
