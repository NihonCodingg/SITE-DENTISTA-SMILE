### Task 15: Localização, FAQ, CTA final e rodapé

**Files:**
- Create: `site/components/sections/Localizacao.tsx`, `Faq.tsx`, `CtaFinal.tsx`, `site/components/layout/Footer.tsx`
- Create: `site/__tests__/rodape.test.tsx`

**Interfaces:**
- Consumes: `FAQ` da Task 4; `ENDERECO`, `MAPS_URL`, `waLink()` da Task 1

- [ ] **Step 1: Escrever o teste que falha**

Criar `site/__tests__/rodape.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/Footer';
import { Localizacao } from '@/components/sections/Localizacao';

vi.stubGlobal('matchMedia', (q: string) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

describe('Footer', () => {
  it('traz os dados legais obrigatorios', () => {
    render(<Footer />);
    expect(screen.getByText(/CNPJ 48\.000\.577\/0001-20/)).toBeInTheDocument();
    expect(screen.getByText(/Responsável técnico/i)).toBeInTheDocument();
    expect(screen.getByText(/não substitui a consulta odontológica/i)).toBeInTheDocument();
  });
});

describe('Localizacao', () => {
  it('usa o numero 507, confirmado pela fachada', () => {
    render(<Localizacao />);
    expect(screen.getByText(/Rua Clemente Pereira, 507/)).toBeInTheDocument();
  });

  it('carrega o mapa de forma preguicosa', () => {
    const { container } = render(<Localizacao />);
    expect(container.querySelector('iframe')).toHaveAttribute('loading', 'lazy');
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd site && npm test -- rodape`
Expected: FAIL

- [ ] **Step 3: Implementar Localização**

Fundo creme, duas colunas. Esquerda: sobretítulo, `<h2>No coração do Ipiranga</h2>`, endereço, referência da Silva Bueno, telefone e WhatsApp, dois botões (Maps e WhatsApp). Direita: `/img/fachada.jpg` com `object-position:center 62%` e o iframe do Google Maps.

**O iframe do Maps é o maior peso de terceiro da página.** Não montar de cara: renderizar um placeholder com a foto da fachada e um botão "Ver no mapa"; o iframe entra só no clique, ou quando a seção entra na viewport — o que vier primeiro. Isso tira ~300KB do carregamento inicial.

- [ ] **Step 4: Implementar FAQ**

`max-width:820px`. Usar `<details>`/`<summary>` nativos — acessíveis de graça e funcionam sem JS. Marcador `+` dourado, borda superior em cada item. Animar a abertura com a API de `details` + Motion, degradando para abertura instantânea sob `!podeAnimar`.

Só as duas perguntas confirmadas. As outras cinco entram quando o cliente responder.

- [ ] **Step 5: Implementar CTA final**

Bloco `bg-amarelo rounded-[32px]`, centralizado. `<h2>` com "sorriso" em Caveat `font-size:1.18em` — **este é o único uso de Caveat no site**. Botão preto com hover branco.

- [ ] **Step 6: Implementar Footer**

Fundo preto. Logo branco 72px, endereço, telefone, WhatsApp em amarelo, Instagram. Bloco legal separado por borda `#2A2A28`: razão social, CNPJ, responsável técnico com o CRO pendente, e o aviso de que o site não substitui consulta.

- [ ] **Step 7: Rodar e confirmar que passa**

Run: `cd site && npm test -- rodape`
Expected: PASS (3 testes)

- [ ] **Step 8: Commit**

```bash
cd site && git add -A && git commit -m "feat: localizacao, FAQ, CTA final e rodape"
```

---

