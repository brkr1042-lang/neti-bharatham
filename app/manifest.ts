import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'నేటి భారతం (Neti Bharatam) News Network',
    short_name: 'NetiBharatam',
    description:
      'National, State, District & Mandal News in Telugu, Hindi & English with Reporter Portal and Live Updates.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FBF9F5',
    theme_color: '#991B1B',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
