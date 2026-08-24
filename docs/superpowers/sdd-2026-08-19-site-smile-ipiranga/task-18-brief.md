### Task 18: QA, acessibilidade e entrega

**Files:**
- Modify: conforme os achados
- Create: `site/README.md`
- Modify: `progress.md`

- [ ] **Step 1: Varredura de breakpoints**

Testar em 320, 375, 414, 768, 1024, 1280, 1440 e 1920. Em cada um, verificar:
- Nenhum scroll horizontal na página (`document.body.scrollWidth <= window.innerWidth`)
- Nenhum texto cortado ou sobreposto
- Toda imagem com proporção correta, sem esticar
- O scroller de tratamentos e o de sorrisos roláveis com o dedo

Este é exatamente o tipo de problema que derrubou o Novakar abaixo de 1024px.

- [ ] **Step 2: Auditoria de acessibilidade**

```bash
cd site && npx @axe-core/cli http://localhost:4173 --exit
```

Corrigir tudo que for `serious` ou `critical`. Verificar à mão:
- Navegação inteira por teclado, com foco sempre visível
- Contraste: preto sobre amarelo `#FCCC24` passa AA; **grafite `#5A5A55` sobre amarelo não passa** — nunca usar essa combinação
- Lightbox e menu mobile prendem e devolvem o foco
- Toda imagem informativa com `alt`; toda decorativa com `alt=""`

- [ ] **Step 3: Rodar com motion reduzido**

Ligar "reduzir movimento" no sistema e recarregar. Confirmar:
- Nenhum canvas WebGL na página
- Nenhum vídeo tocando sozinho
- Todo conteúdo visível e legível
- O ticker parado

- [ ] **Step 4: Rodar com economia de dados**

No DevTools, simular `saveData`. Confirmar que nenhum `.mp4` é requisitado.

- [ ] **Step 5: Conferir a lista de dados não inventados**

Buscar no HTML gerado por padrões proibidos:

```bash
cd site && npm run build && grep -rEi "[0-9]+\+ (pacientes|clientes|anos)|[0-9],[0-9] estrelas|melhor clínica|garantido" .next/server/app/ || echo "limpo"
```

Expected: `limpo`

- [ ] **Step 6: Escrever o README do projeto**

`site/README.md` com: como rodar, como buildar, onde ficam os assets, como trocar um vídeo, e a lista de pendências que bloqueiam a publicação.

- [ ] **Step 7: Atualizar o progress.md**

Marcar FASES 5, 6, 7 e 8 como concluídas. Registrar os números do Lighthouse e o que ficou pendente.

- [ ] **Step 8: Commit**

```bash
cd site && git add -A && git commit -m "chore: QA de breakpoints, acessibilidade e documentacao"
```

---

## Bloqueios antes de publicar

Nenhum deles impede construir. Todos impedem ir ao ar.

1. **CRO do responsável técnico** — o site mostra "CRO-SP a confirmar" em duas posições
2. **Autorização de uso de imagem** dos pacientes nos retratos, antes/depois e vídeos
3. **Trecho de procedimento** nos vídeos completos `caso-protese` e `facetas-transformacao` (ver `VIDEOS/README.md`)
4. **Horário de atendimento** — sem ele, não entra `openingHoursSpecification` no JSON-LD nem a linha de horário no site
5. **`trat-clareamento.jpg`** — hoje reaproveitando a imagem da limpeza

Ver `PERGUNTAS-CLIENTE.md`.
