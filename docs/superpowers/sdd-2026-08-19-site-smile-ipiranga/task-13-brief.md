### Task 13: Sorrisos feitos aqui (galeria WebGL de retratos)

> Este arquivo não existia quando a implementação começou — reconstruído a partir da mensagem de
> orientação recebida (que já continha o brief completo), no mesmo padrão dos demais
> `task-N-brief.md`, para manter o ledger da SDD consistente. Ver `task-13-report.md` para o que foi
> de fato entregue, decisões tomadas e custos registrados.

**Files:**
- Create: `site/components/reactbits/CircularGallery.tsx` (vendorizado, com modificações)
- Create: `site/components/sections/Sorrisos.tsx`, `site/components/sections/SorrisosGaleria.tsx`
- Create: `site/__tests__/sorrisos.test.tsx`, `site/__tests__/circularGallery.test.tsx`
- Modify: `site/components/ui/SectionHeading.tsx` (prop `tema` para fundo escuro)
- Modify: `site/components/sections/PaginaComVideo.tsx`, `site/app/page.tsx`
- Modify: `site/components/reactbits/README.md` (proveniência + modificações do CircularGallery)

**Interfaces:**
- Consome: `SORRISOS` (`lib/content.ts`, 9 `{img, n}`), `useCapability()` (`lib/useCapability.ts`),
  `<Reveal>`, `<SectionHeading>`
- `CircularGallery` vendorizado de
  `https://raw.githubusercontent.com/DavidHDev/react-bits/<commit fixado no README>/src/ts-tailwind/Components/CircularGallery/CircularGallery.tsx`
  — **não** via `npx shadcn add` (registry fora do ar, ver `reactbits-vendoring.md`)

**Decisão do parceiro que vale aqui:** usar o máximo possível do React Bits mesmo com custo
técnico ("resolve depois") — por isso o `CircularGallery` é vendorizado e usado (não implementado à
mão), ao contrário do que uma tabela anterior (`emenda-reactbits-e-skills.md`) previa.

**O que a seção é:** fundo `#111111` (`--color-preto`), sobretítulo "Pacientes reais" em amarelo,
`<h2>` "Sorrisos feitos aqui" em branco. Os 9 retratos numa galeria WebGL com inércia
(`CircularGallery`), montada só quando `useCapability().podePesado`.

**Fallback obrigatório:** quando `podePesado` é false, a seção vira um scroller horizontal com
snap, `next/image`, figuras levemente rotacionadas/deslocadas (só `transform`). Mesmo conteúdo e
título nos dois modos.

**Requisitos duros:**
- `ogl` fora do first-load JS da rota — `next/dynamic({ssr:false})`, confirmado na saída do
  `npm run build`.
- Canvas pausa fora da viewport E com `document.hidden` (padrão de `Silk.tsx`).
- Cleanup completo no unmount: `WEBGL_lose_context`, `cancelAnimationFrame`, observers
  desconectados.
- Acessibilidade: WebGL marcado decorativo (`aria-hidden`) com equivalente textual; fallback com
  `alt="Paciente da Smile sorrindo"` (nunca nome de paciente).

**Processo:** teste primeiro (confirma falha), implementa, confirma que passa. Depois
`npm run dev -- -p 4000`, verificar em 375px e 1280px.

Ver `task-13-report.md` para a execução completa.

---
