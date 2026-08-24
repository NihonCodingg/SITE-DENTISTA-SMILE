# React Bits — como trazer os componentes (o plano está desatualizado)

**Leitura obrigatória para as Tasks 8, 9, 10, 12 e 13.**

## O que mudou

O plano manda instalar via registry do shadcn:

```bash
npx shadcn@latest add @react-bits/silk        # NÃO FUNCIONA
```

**Isso não funciona.** Verifiquei os endpoints direto: `https://reactbits.dev/r/<nome>.json`
devolve HTTP 200 com o shell HTML do site (`<!doctype html>...`), não JSON de registry — para
todos os componentes testados, e em todas as variações de caminho que tentei
(`/r/styles/default/`, `/registry/`, `/r/<nome>` sem extensão). Não é problema do sandbox nem
de cache: é o registry que não está servindo JSON.

Não perca tempo tentando de novo nem depurando o `shadcn`.

## O que fazer no lugar: vendorizar do repositório oficial

O código está no GitHub, na variante que casa exatamente com nosso stack (TypeScript + Tailwind):

```
https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/ts-tailwind/<Categoria>/<Nome>/<Nome>.tsx
```

Baixe para `site/components/reactbits/<Nome>.tsx` e importe de lá.

### Caminhos já confirmados

| Componente | Caminho no repo | Usado na Task |
|---|---|---|
| `SplitText` | `src/ts-tailwind/TextAnimations/SplitText/SplitText.tsx` | 8 |
| `Silk` | `src/ts-tailwind/Backgrounds/Silk/Silk.tsx` | 8 |
| `Magnet` | `src/ts-tailwind/Animations/Magnet/Magnet.tsx` | 8 |
| `ScrollVelocity` | `src/ts-tailwind/TextAnimations/ScrollVelocity/ScrollVelocity.tsx` | 9 |
| `GlareHover` | `src/ts-tailwind/Animations/GlareHover/GlareHover.tsx` | 10 |
| `GradualBlur` | `src/ts-tailwind/Animations/GradualBlur/GradualBlur.tsx` | 12 |
| `CircularGallery` | `src/ts-tailwind/Components/CircularGallery/CircularGallery.tsx` | 13 |

Se precisar de outro, ache o caminho listando a árvore do repo — o padrão é
`src/ts-tailwind/{TextAnimations,Animations,Components,Backgrounds}/<Nome>/<Nome>.tsx`.

## Licença — obrigações reais

**MIT + Commons Clause.** Permite usar, copiar, modificar e distribuir **"as part of an
application, website, or product"**, inclusive para fim comercial. A única restrição é não
*vender, sublicenciar ou redistribuir os componentes em si*, isolados ou em bundle.

Site de cliente está coberto sem problema.

**Obrigação que você precisa cumprir:** o aviso de copyright tem que acompanhar o código.
Na primeira task que vendorizar algo (Task 8), crie:

`site/components/reactbits/LICENSE.md` — cópia de
`https://raw.githubusercontent.com/DavidHDev/react-bits/main/LICENSE.md`

e um `site/components/reactbits/README.md` curto dizendo de onde veio cada arquivo, em qual
commit, e que foram modificados (se foram).

## Antes de aceitar qualquer componente vendorizado

O código vem de terceiro e vai para o site de um cliente real. **Leia o arquivo inteiro antes de
usar**, e confirme:

1. **Dependências que ele arrasta.** `Silk` e `CircularGallery` usam `ogl`. `SplitText`,
   `ScrollVelocity` e `Magnet` normalmente usam `gsap` ou `motion` — ambos já estão no projeto.
   Se um componente exigir `three`, pare e reporte: three.js num site de clínica não se paga.
2. **Nada de rede.** Nenhum `fetch`, nenhuma URL externa, nenhum script remoto. Se houver, reporte.
3. **Respeita nosso gate de motion.** O componente não pode consultar `matchMedia` ou
   `navigator.connection` por conta própria — esse papel é do `useCapability()`. Se ele fizer isso
   internamente, **remova** a checagem dele e deixe o controle com o nosso hook, para não termos
   duas fontes de verdade sobre reduced-motion.
4. **Cleanup.** Componente com `requestAnimationFrame`, `ResizeObserver` ou WebGL precisa
   desmontar limpo. Se o cleanup estiver faltando ou incompleto, **conserte** e registre no
   relatório — vazamento de rAF numa página que o visitante rola inteira é bug caro.
5. **Só `transform` e `opacity`.** Se o componente animar `width`, `height`, `top` ou `left`,
   avalie se dá para trocar; se não der, reporte.

Modificar é permitido pela licença e esperado. Registre no relatório toda modificação que fizer.

## Quando NÃO usar o componente

Se o componente do React Bits for pesado ou complicado demais para o que a seção precisa,
implemente à mão seguindo `design-guidance.md`. Já aconteceu na Task 6: o `StaggeredMenu` não
foi usado e o drawer saiu à mão com a lib `motion`, com resultado melhor e mais leve.

O React Bits é meio, não fim. A régua é o que serve à página.
