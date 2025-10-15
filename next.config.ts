import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      // Opcional pero recomendado: Añade aquí el hostname de tu proyecto de Supabase
      // para poder mostrar imágenes subidas por los usuarios en el futuro.
      // Reemplaza "bejgvtqhmyhmucrflafk.supabase.co" con el tuyo.
      {
        protocol: 'https',
        hostname: 'bejgvtqhmyhmucrflafk.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;