import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Site de página única (Task 16): só a raiz existe hoje. Se novas rotas
// forem adicionadas depois, elas entram aqui.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
