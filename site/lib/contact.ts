export const TELEFONE = '+5511981691210';
export const TELEFONE_DISPLAY = '(11) 98169-1210';
export const WHATSAPP_E164 = '551122740228';
export const WHATSAPP_DISPLAY = '(11) 2274-0228';

export const ENDERECO = {
  rua: 'Rua Clemente Pereira',
  numero: '507',
  bairro: 'Ipiranga',
  cidade: 'São Paulo',
  uf: 'SP',
  cep: '04216-060',
  referencia: 'região da Rua Silva Bueno',
} as const;

export const INSTAGRAM = 'https://www.instagram.com/smileipiranga';

export const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('Rua Clemente Pereira, 507, Ipiranga, São Paulo');

export function waLink(mensagem = 'Olá! Quero agendar uma avaliação.'): string {
  return `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(mensagem)}`;
}
