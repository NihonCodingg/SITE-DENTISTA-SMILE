# -*- coding: utf-8 -*-
"""
Fallback LOCAL para os 3 assets de marca que deveriam vir do Claude Design
(logo.png, logo-branco.png, sorriso-arco.png).

Recorta o logo em alta resolucao que aparece no canto superior direito de
'IMAGENS DO INSTAGRAM/766322335_18029281163845208_6745603955996636678_n.jpg',
remove o fundo branco (viram alfa) e gera:
  - logo.png          : logotipo original (preto + arco dourado), fundo transparente
  - logo-branco.png    : mesma silhueta, toda em branco (para o rodape preto)
  - sorriso-arco.png   : so o arco dourado, isolado, fundo transparente

Isto e um FALLBACK. O ideal e o export limpo do Claude Design; o parceiro
deve substituir estes arquivos assim que tiver o export oficial.
"""
from PIL import Image

SRC = "IMAGENS DO INSTAGRAM/766322335_18029281163845208_6745603955996636678_n.jpg"
OUT = "site/public/img"

# Caixas de recorte encontradas por inspecao visual + varredura de pixel
# (ver relatorio da Task 2 para o metodo).
LOGO_BOX = (615, 8, 1090, 250)      # arco + "Smile" + "Saude & Estetica Orofacial"
ARCO_BOX = (720, 5, 980, 110)       # regiao generosa em torno do arco dourado

ALPHA_CUTOFF = 15   # abaixo disso -> transparente total (ruido de JPEG do fundo)
ALPHA_RANGE = 240   # 255 - ALPHA_CUTOFF, usado para re-escalar o alfa restante


def remove_white_to_alpha(im_rgb):
    """Converte fundo branco em alfa, com 'des-premultiply' pra nao deixar
    halo esbranquicado nas bordas quando compositar sobre outra cor."""
    im_rgb = im_rgb.convert("RGB")
    w, h = im_rgb.size
    src = im_rgb.load()
    out = Image.new("RGBA", (w, h))
    dst = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = src[x, y]
            raw_alpha = 255 - min(r, g, b)
            if raw_alpha < 1:
                dst[x, y] = (0, 0, 0, 0)
                continue
            nr = (r - (255 - raw_alpha)) * 255.0 / raw_alpha
            ng = (g - (255 - raw_alpha)) * 255.0 / raw_alpha
            nb = (b - (255 - raw_alpha)) * 255.0 / raw_alpha
            nr = max(0, min(255, round(nr)))
            ng = max(0, min(255, round(ng)))
            nb = max(0, min(255, round(nb)))
            if raw_alpha <= ALPHA_CUTOFF:
                out_alpha = 0
            else:
                out_alpha = min(255, round((raw_alpha - ALPHA_CUTOFF) * 255.0 / ALPHA_RANGE))
            dst[x, y] = (nr, ng, nb, out_alpha)
    return out


def trim(im_rgba, pad=10):
    bbox = im_rgba.getbbox()
    if not bbox:
        return im_rgba
    x0, y0, x1, y1 = bbox
    w, h = im_rgba.size
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(w, x1 + pad)
    y1 = min(h, y1 + pad)
    return im_rgba.crop((x0, y0, x1, y1))


def is_gold(r, g, b):
    return r > 150 and g > 90 and b < 150 and (r - b) > 60


def main():
    src_im = Image.open(SRC)

    # 1) logo.png -- logotipo completo, cores originais, fundo transparente
    logo_crop = src_im.crop(LOGO_BOX)
    logo_rgba = remove_white_to_alpha(logo_crop)
    logo_rgba = trim(logo_rgba, pad=14)
    logo_rgba.save(f"{OUT}/logo.png")
    print("ok logo.png", logo_rgba.size, "alpha:", logo_rgba.mode == "RGBA")

    # 2) logo-branco.png -- mesma silhueta, tudo em branco (rodape preto)
    w, h = logo_rgba.size
    px = logo_rgba.load()
    branco = Image.new("RGBA", (w, h))
    bpx = branco.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            bpx[x, y] = (255, 255, 255, a)
    branco.save(f"{OUT}/logo-branco.png")
    print("ok logo-branco.png", branco.size)

    # 3) sorriso-arco.png -- so o arco dourado, isolado
    arco_crop = src_im.crop(ARCO_BOX)
    arco_rgba = remove_white_to_alpha(arco_crop)
    # mascarar qualquer coisa que nao seja dourada (pontas de letras vizinhas)
    w2, h2 = arco_rgba.size
    apx = arco_rgba.load()
    for y in range(h2):
        for x in range(w2):
            r, g, b, a = apx[x, y]
            if a > 0 and not is_gold(r, g, b):
                apx[x, y] = (0, 0, 0, 0)
    arco_rgba = trim(arco_rgba, pad=10)
    arco_rgba.save(f"{OUT}/sorriso-arco.png")
    print("ok sorriso-arco.png", arco_rgba.size)


if __name__ == "__main__":
    main()
