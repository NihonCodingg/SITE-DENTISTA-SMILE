import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Site de página única (Task 16): só a raiz existe hoje. Se novas rotas
// forem adicionadas depois, elas entram aqui.
//
// Sem `lastModified`: com `new Date()` a data mudava a cada build e dizia ao
// crawler que a página tinha sido alterada quando nada tinha mudado. Omitir é
// honesto — o campo é opcional, e um sitemap que mente sobre frescor perde a
// confiança do crawler. Se um dia o conteúdo passar a ter data de alteração
// real (CMS, front-matter), é ela que entra aqui.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
