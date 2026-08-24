# Emenda ao plano — decisões do parceiro em 20/08/2026

Duas decisões que mudam o escopo restante. Ambas são do parceiro, tomadas depois de eu apresentar
os custos. **Elas sobrepõem julgamentos meus anteriores.**

---

## 1. React Bits: forçar o máximo possível

**Decisão literal:** *"Pode forçar o máximo possível, depois que o projeto finalizar se houver
muitos custos técnicos podemos resolver."*

Eu tinha recusado 4 dos 6 componentes por motivo técnico, um por task, sem nunca apresentar o
acumulado. Apresentei, e a decisão foi reverter. **Não relitigar.**

### Situação atual

| Componente | Task | Hoje | Ação |
|---|---|---|---|
| `SplitText` | 8 | ✅ vendorizado e em uso | manter |
| `Magnet` | 8 | ✅ vendorizado e em uso | manter |
| `StaggeredMenu` | 6 | ❌ recusado — registry fora do ar | **recuperar** |
| `Silk` | 8 | ❌ recusado — exige three.js | **recuperar** |
| `ScrollVelocity` | 9 | ❌ recusado — nunca pausa | **recuperar** |
| `GlareHover` | 10 | ❌ recusado — anima background-position | **recuperar** |
| `GradualBlur` | 12 | a fazer | usar nativo |
| `CircularGallery` | 13 | a fazer | usar nativo |

**Nota importante sobre o `StaggeredMenu`:** ele foi recusado na Task 6 porque o *registry* estava
fora do ar. A descoberta de que dá para vendorizar do GitHub veio **depois**, na Task 8. Ou seja,
ele nunca foi avaliado pelo mérito — está disponível.

### Nova Task 19 — "Maximizar React Bits"

**Quando:** depois da Task 15 (todas as seções prontas), **antes** da Task 16.
Motivo do posicionamento: trocar componentes que já passaram por review gera retrabalho se feito
agora; e a Task 17 (performance) precisa medir o que de fato vai ao ar, não um estado intermediário.

**O que faz:** substituir as 4 implementações à mão pelos componentes originais do React Bits,
vendorizados do GitHub conforme `reactbits-vendoring.md`.

**Critérios de aceitação que NÃO podem cair na troca** — foram conquistados a duro custo e a
substituição precisa preservá-los ou o componente não entra:

- **Menu mobile:** foco preso nas duas direções · foco devolvido ao hambúrguer · `Escape` fecha ·
  `aria-expanded`/`aria-controls` · `aria-hidden`/`inert` corretos inclusive durante a saída e na
  reabertura rápida · scroll travado via `useLenis()?.stop()` · feedback de toque nos itens ·
  **nenhum overflow horizontal** (`scrollWidth === outerWidth` em 375px) · **nenhum recorte**
  (`elementFromPoint` no meio do painel retorna elemento do drawer)
  > Este é o componente de maior risco da troca. O drawer atual custou 3 rodadas de correção para
  > resolver overflow, clipping por containing block e `inert` preso. O `StaggeredMenu` original
  > provavelmente não trata nada disso. Se ele não passar nos critérios, **relatar e manter o atual** —
  > "forçar o máximo" não inclui entregar um menu quebrado.
- **Ticker:** pausa fora da viewport E com `document.hidden`
- **Silk:** o WebGL pausa fora da viewport, destrói o contexto no unmount, e `three` entra por
  `next/dynamic({ssr:false})` — **nunca no bundle inicial da rota**
- **GlareHover:** se animar `background-position`, aceitar (decisão do parceiro), mas medir o custo
  no Lighthouse da Task 17 e registrar

**Registrar o custo, não escondê-lo.** A Task 17 mede antes e depois desta troca e documenta a
diferença em KB, LCP e TBT. O parceiro disse que resolve custos técnicos depois — para isso ele
precisa do número.

---

## 2. Skills de design: usar todas

**Decisão literal:** *"Use o máximo das skills de design que vc tiver"* — com `impeccable`,
`ui-ux-pro-max`, `animate` e a do Emil todas marcadas.

| Skill | Onde entra | Para quê |
|---|---|---|
| `emil-design-eng` | já em uso | `design-guidance.md`, leitura obrigatória de toda task de UI |
| `ui-ux-pro-max` | **antes da Task 12** | base de estilos, paletas, pares tipográficos, diretrizes de UX e presets de motion GSAP — destilar o que servir para as seções 12-15 |
| `animate` | **antes da Task 13** | decisões de motion da galeria WebGL, o momento de impacto da página |
| `impeccable` | **Task 18** | auditoria completa da interface montada: hierarquia, carga cognitiva, acessibilidade, estados, responsivo |

Cada skill que eu carregar vira um documento destilado neste workspace, no mesmo padrão do
`design-guidance.md`, e entra como leitura obrigatória nas tasks que ela cobre. **Se duas skills
se contradisserem, a decisão é minha e vai registrada no ledger** — o implementador não pode ficar
com duas orientações conflitantes.
