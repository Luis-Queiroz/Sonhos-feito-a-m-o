/* =====================================================================
   CONFIGURAÇÃO DA LOJA: edite aqui preços, prazos e frete.
   ===================================================================== */
const CONFIG = {
  whatsapp: '5543996414608',

  // Dados exigidos para venda online (Decreto 7.962/2013). Preenchidos, aparecem no rodapé.
  documento: '',      // Ex.: 'CNPJ 00.000.000/0001-00'
  enderecoLoja: '',   // Ex.: 'Rua Exemplo, 100, Cidade/UF'

  // Dias úteis para fazer a bolsa à mão, antes da postagem.
  diasProducao: 5,

  // Acréscimo no frete a cada bolsa além da primeira, por envio.
  adicionalPorBolsa: 8,

  produtos: {
    ana: {
      nome: 'Bag Ana', preco: 289,
      descricao: 'Preta, marcante e com ferragens prateadas. Elegância em todos os momentos.',
      detalhes: ['Crochê feito à mão', 'Ferragens prateadas', 'Etiqueta metálica da marca']
    },
    estilosa: {
      nome: 'Bolsa Estilosa', preco: 269,
      descricao: 'Vermelha, leve e prática. Praticidade e beleza para o seu dia a dia, com estilo único.',
      detalhes: ['Crochê feito à mão', 'Argolas douradas', 'Selo “Feito à mão”', 'Leve e prática']
    },
    rosa: {
      nome: 'Bolsa Rosa', preco: 239,
      descricao: 'Em formato de flor, com alça de corrente. Para quando o look pede um ponto de destaque.',
      detalhes: ['Crochê feito à mão', 'Formato de flor', 'Alça de corrente prateada']
    }
  },

  // Tabela de frete por região: valor em reais e dias úteis de transporte.
  regioes: {
    PR:      { ufs: ['PR'], economico: { valor: 18, dias: 5 }, expresso: { valor: 32, dias: 2 } },
    proximo: { ufs: ['SP', 'SC', 'RS'], economico: { valor: 24, dias: 7 }, expresso: { valor: 42, dias: 3 } },
    centro:  { ufs: ['RJ', 'MG', 'ES', 'MS', 'GO', 'DF', 'MT'], economico: { valor: 28, dias: 8 }, expresso: { valor: 48, dias: 4 } },
    nordeste:{ ufs: ['BA', 'SE', 'AL', 'PE', 'PB', 'RN', 'CE', 'PI', 'MA'], economico: { valor: 38, dias: 12 }, expresso: { valor: 68, dias: 5 } },
    norte:   { ufs: ['TO', 'PA', 'AP', 'AM', 'RR', 'RO', 'AC'], economico: { valor: 46, dias: 15 }, expresso: { valor: 82, dias: 7 } }
  }
};

/* ---------- Ao recarregar (F5), a página volta para o topo ---------- */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const navegacao = performance.getEntriesByType('navigation')[0];
if (navegacao && navegacao.type === 'reload') {
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  window.scrollTo({ top: 0, behavior: 'instant' });
  window.addEventListener('load', () => window.scrollTo({ top: 0, behavior: 'instant' }));
} else if (location.hash) {
  // Link direto para uma seção (ex.: #loja): rola até ela depois que as fotos carregam
  const irParaSecao = () => {
    const alvo = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (alvo) alvo.scrollIntoView({ behavior: 'instant' });
  };
  irParaSecao();
  window.addEventListener('load', irParaSecao);
}

/* ---------- Utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reais = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dataCurta = (d) => d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
const UFS = Object.values(CONFIG.regioes).flatMap((r) => r.ufs).sort();

/* ---------- Dias úteis: sem fim de semana e feriados nacionais ---------- */
function pascoa(ano) {
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia);
}
const chave = (d) => d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
const feriadosPorAno = {};
function feriados(ano) {
  if (feriadosPorAno[ano]) return feriadosPorAno[ano];
  const fixos = [[0, 1], [3, 21], [4, 1], [8, 7], [9, 12], [10, 2], [10, 15], [10, 20], [11, 25]].map(([m, d]) => new Date(ano, m, d));
  const p = pascoa(ano);
  const moveis = [-48, -47, -2, 60].map((n) => new Date(ano, p.getMonth(), p.getDate() + n)); // Carnaval, Sexta-feira Santa, Corpus Christi
  return (feriadosPorAno[ano] = new Set([...fixos, ...moveis].map(chave)));
}
const ehUtil = (d) => d.getDay() !== 0 && d.getDay() !== 6 && !feriados(d.getFullYear()).has(chave(d));
function somarDiasUteis(inicio, n) {
  const d = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
  while (n > 0) { d.setDate(d.getDate() + 1); if (ehUtil(d)) n--; }
  return d;
}

/* ---------- Sacola ---------- */
let itens = {};
try { itens = JSON.parse(localStorage.getItem('sacola-sonhos') || '{}'); } catch (e) { itens = {}; }
Object.keys(itens).forEach((id) => { if (!CONFIG.produtos[id]) delete itens[id]; });
const salvar = () => { try { localStorage.setItem('sacola-sonhos', JSON.stringify(itens)); } catch (e) { /* segue sem salvar */ } };
const totalBolsas = () => Object.values(itens).reduce((s, q) => s + q, 0);
const subtotal = () => Object.entries(itens).reduce((s, [id, q]) => s + CONFIG.produtos[id].preco * q, 0);

/* ---------- Frete ---------- */
const entrega = { cep: '', uf: '', cidade: '', logradouro: '', bairro: '', estado: 'vazio', envio: 'economico' };
const cliente = { nome: '', telefone: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', pagamento: 'Pix', observacoes: '' };

function opcoesFrete() {
  const regiao = Object.values(CONFIG.regioes).find((r) => r.ufs.includes(entrega.uf));
  if (!regiao) return [];
  const extra = CONFIG.adicionalPorBolsa * Math.max(0, totalBolsas() - 1);
  const hoje = new Date();
  const postagem = somarDiasUteis(hoje, CONFIG.diasProducao);
  return [['economico', 'Econômico'], ['expresso', 'Expresso']].map(([id, nome]) => ({
    id, nome,
    valor: regiao[id].valor + extra,
    diasEnvio: regiao[id].dias,
    diasTotal: CONFIG.diasProducao + regiao[id].dias,
    postagem,
    chegada: somarDiasUteis(postagem, regiao[id].dias)
  }));
}
const envioEscolhido = () => opcoesFrete().find((o) => o.id === entrega.envio);

/* Consulta o CEP em APIs abertas: ViaCEP primeiro e BrasilAPI como reserva.
   Retorna o endereço, null se o CEP não existir, ou lança erro se nenhuma responder. */
async function consultarCep(cep) {
  let viaCepRespondeu = false;
  try {
    const r = await fetch('https://viacep.com.br/ws/' + cep + '/json/');
    if (r.ok) {
      const d = await r.json();
      viaCepRespondeu = true;
      if (!d.erro) return { uf: d.uf, cidade: d.localidade, logradouro: d.logradouro, bairro: d.bairro };
    }
  } catch (e) { /* tenta a reserva */ }
  try {
    const r = await fetch('https://brasilapi.com.br/api/cep/v2/' + cep);
    if (r.ok) {
      const d = await r.json();
      return { uf: d.state, cidade: d.city, logradouro: d.street || '', bairro: d.neighborhood || '' };
    }
    if (r.status === 404) return null;
  } catch (e) { /* trata abaixo */ }
  if (viaCepRespondeu) return null;
  throw new Error('Sem resposta das APIs de CEP');
}

async function buscarCep(valor) {
  const cep = valor.replace(/\D/g, '');
  entrega.cep = cep;
  Object.assign(entrega, { uf: '', cidade: '', logradouro: '', bairro: '' });
  if (cep.length !== 8) { entrega.estado = 'invalido'; return atualizarCalculos(); }
  entrega.estado = 'buscando';
  atualizarCalculos();
  try {
    const endereco = await consultarCep(cep);
    if (entrega.cep !== cep) return; // a cliente já digitou outro CEP
    if (!endereco) { entrega.estado = 'naoencontrado'; return atualizarCalculos(); }
    Object.assign(entrega, endereco, { estado: 'ok' });
    Object.assign(cliente, { logradouro: endereco.logradouro, bairro: endereco.bairro, cidade: endereco.cidade, uf: endereco.uf });
  } catch (e) {
    if (entrega.cep !== cep) return;
    entrega.estado = 'semconexao'; // CEP não consultado: a cliente escolhe o estado
  }
  atualizarCalculos();
}

const cepFormatado = () => entrega.cep.replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
let idCalc = 0;

function htmlCalculadora() {
  const id = 'cep-' + (++idCalc);
  return `<form data-calc novalidate>
      <label for="${id}" class="block font-medium mb-2">Calcule o frete e o prazo</label>
      <div class="flex gap-2">
        <input id="${id}" name="cep" class="campo" inputmode="numeric" autocomplete="postal-code" placeholder="00000-000" maxlength="9" value="${esc(cepFormatado())}">
        <button class="btn-contorno shrink-0" type="submit">Calcular</button>
      </div>
    </form>
    <div data-calc-res class="mt-4" aria-live="polite">${htmlResultado()}</div>`;
}

function htmlResultado() {
  const seletorUf = `<label class="block mt-3 text-sm">Selecione seu estado para estimar o frete
      <select data-uf-manual class="campo mt-1"><option value="">Estado</option>${UFS.map((u) => `<option ${u === entrega.uf ? 'selected' : ''}>${u}</option>`).join('')}</select></label>`;
  if (entrega.estado === 'vazio') return '<p class="text-sm text-tinta-suave">Digite o CEP de entrega para ver as opções.</p>';
  if (entrega.estado === 'buscando') return '<p class="text-sm text-tinta-suave">Consultando o CEP…</p>';
  if (entrega.estado === 'invalido') return '<p class="text-sm text-vinho">Digite um CEP com 8 números.</p>';
  if (entrega.estado === 'naoencontrado') return '<p class="text-sm text-vinho">Não encontramos esse CEP. Confira os números e tente de novo.</p>';
  if (entrega.estado === 'semconexao' && !entrega.uf) return '<p class="text-sm text-vinho">Não foi possível consultar o CEP agora.</p>' + seletorUf;

  const opcoes = opcoesFrete();
  if (!opcoes.length) return '<p class="text-sm text-vinho">Ainda não temos frete para esse destino. Fale conosco no WhatsApp.</p>';
  const nome = 'envio-' + (++idCalc);
  const sel = opcoes.find((o) => o.id === entrega.envio) || opcoes[0];
  const cidadeUf = entrega.cidade ? entrega.cidade + '/' + entrega.uf : entrega.uf;
  const destino = esc([entrega.logradouro, entrega.bairro, cidadeUf].filter(Boolean).join(', '));
  return `<p class="text-sm text-tinta-suave mb-3">Entrega em <strong class="font-medium text-tinta">${destino}</strong>${totalBolsas() > 1 ? ', para ' + totalBolsas() + ' bolsas' : ''}</p>
    <div class="space-y-2">
      ${opcoes.map((o) => `<label class="flex items-center gap-3 border rounded-xl p-3 cursor-pointer bg-white ${o.id === sel.id ? 'border-vinho' : 'border-[#D8CBB7]'}">
        <input type="radio" name="${nome}" value="${o.id}" data-envio class="accent-[#7A1420]" ${o.id === sel.id ? 'checked' : ''}>
        <span class="flex-1 min-w-0"><strong class="block font-medium">${o.nome}</strong><span class="block text-sm text-tinta-suave">Chega até ${dataCurta(o.chegada)} · ${o.diasTotal} dias úteis</span></span>
        <span class="font-medium whitespace-nowrap">${reais(o.valor)}</span>
      </label>`).join('')}
    </div>
    <ol class="mt-5 grid grid-cols-3 gap-2 text-center text-xs" aria-label="Etapas do prazo">
      <li class="relative"><span class="block mx-auto w-3 h-3 rounded-full bg-vinho"></span><strong class="block mt-2 font-medium">Pedido</strong><span class="text-tinta-suave">Hoje</span></li>
      <li class="relative"><span class="block mx-auto w-3 h-3 rounded-full bg-ouro"></span><strong class="block mt-2 font-medium">Bolsa pronta</strong><span class="text-tinta-suave">${dataCurta(sel.postagem)}<br>${CONFIG.diasProducao} dias úteis</span></li>
      <li class="relative"><span class="block mx-auto w-3 h-3 rounded-full bg-noir"></span><strong class="block mt-2 font-medium">Na sua casa</strong><span class="text-tinta-suave">até ${dataCurta(sel.chegada)}<br>+${sel.diasEnvio} dias úteis</span></li>
    </ol>
    ${entrega.estado === 'semconexao' ? seletorUf : ''}
    <p class="mt-3 text-xs text-tinta-suave">Estimativa contada a partir de hoje. O prazo é confirmado com o pagamento.</p>`;
}

function atualizarCalculos() {
  $$('[data-calc-res]').forEach((el) => { el.innerHTML = htmlResultado(); });
  $$('[data-calc] input[name=cep]').forEach((el) => { if (el !== document.activeElement) el.value = cepFormatado(); });
  if (!$('#sacola').open) return;
  // Na sacola, os totais acompanham o frete sem perder o campo de CEP
  const totais = $('[data-totais]');
  if (totais) totais.innerHTML = htmlTotais();
  const erro = $('[data-erro]');
  if (erro && envioEscolhido()) erro.classList.add('hidden');
}

function htmlTotais() {
  const envio = envioEscolhido();
  return `<div class="flex justify-between"><span>Subtotal</span><span>${reais(subtotal())}</span></div>
    <div class="flex justify-between"><span>Frete${envio ? ' (' + envio.nome + ')' : ''}</span><span>${envio ? reais(envio.valor) : 'Calcule acima'}</span></div>
    <div class="flex justify-between text-xl font-medium mt-2"><span>Total</span><span>${reais(subtotal() + (envio ? envio.valor : 0))}</span></div>`;
}

/* ---------- Produto ---------- */
function abrirProduto(id) {
  const p = CONFIG.produtos[id];
  const foto = $(`[data-produto="${id}"] img`);
  const dlg = $('#produto');
  dlg.innerHTML = `<div class="sticky top-3 z-10 h-0 flex justify-end pr-3">
      <button type="button" data-acao="fechar-produto" class="h-10 w-10 flex items-center justify-center rounded-full bg-marfim shadow" aria-label="Fechar">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </div>
    <div class="grid md:grid-cols-2">
      <div class="bg-areia flex items-center justify-center p-4 md:p-6"><img src="${foto.src}" alt="${esc(foto.alt)}" class="w-full h-auto max-h-[45vh] md:max-h-[calc(100dvh-7rem)] object-contain rounded-2xl"></div>
      <div class="p-6 sm:p-8">
        <h2 id="produto-nome" class="font-titulo text-4xl font-semibold pr-8">${esc(p.nome)}</h2>
        <p class="mt-2 text-2xl font-medium">${reais(p.preco)}</p>
        <p class="mt-3 text-tinta-suave leading-relaxed">${esc(p.descricao)}</p>
        <ul class="mt-4 space-y-1.5 text-sm">${p.detalhes.map((d) => `<li class="flex gap-2"><span class="text-ouro-texto" aria-hidden="true">♥</span>${esc(d)}</li>`).join('')}</ul>
        <button type="button" data-acao="comprar" data-id="${id}" class="btn-principal w-full mt-6">Comprar agora</button>
        <button type="button" data-acao="adicionar" data-id="${id}" class="btn-contorno w-full mt-2">Adicionar à sacola</button>
        <div class="mt-6 pt-6 border-t border-areia">${htmlCalculadora()}</div>
      </div>
    </div>`;
  dlg.showModal();
}

/* ---------- Sacola e checkout ---------- */
let etapa = 'sacola';
let codigoPedido = '';

function cabecalhoSacola(titulo) {
  const etapas = ['sacola', 'dados', 'revisao'];
  const marcador = etapas.includes(etapa) && totalBolsas() ? `<ol class="flex gap-1.5 mt-3" aria-label="Etapa ${etapas.indexOf(etapa) + 1} de 3">${etapas.map((e, i) => `<li class="h-1 flex-1 rounded-full ${i <= etapas.indexOf(etapa) ? 'bg-vinho' : 'bg-areia'}"></li>`).join('')}</ol>` : '';
  return `<header class="px-5 py-4 border-b border-areia shrink-0">
      <div class="flex items-center justify-between">
        <h2 class="font-titulo text-3xl font-semibold">${titulo}</h2>
        <button type="button" data-acao="fechar-sacola" class="p-1" aria-label="Fechar sacola"><svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" d="M6 6l12 12M18 6 6 18"/></svg></button>
      </div>${marcador}
    </header>`;
}

function viewSacola() {
  if (!totalBolsas()) {
    return cabecalhoSacola('Sua sacola') + `<div class="flex-1 flex flex-col items-center justify-center text-center p-8">
        <p class="font-script text-4xl text-ouro-texto">Ainda vazia</p>
        <p class="mt-2 text-tinta-suave">Que tal escolher a bolsa dos seus sonhos?</p>
        <button type="button" data-acao="fechar-sacola" class="btn-contorno mt-6">Ver os modelos</button>
      </div>`;
  }
  const linhas = Object.entries(itens).map(([id, q]) => {
    const p = CONFIG.produtos[id];
    const foto = $(`[data-produto="${id}"] img`);
    return `<li class="flex gap-3 py-4 border-b border-areia">
        <img src="${foto.src}" alt="" class="w-20 h-20 rounded-xl object-cover shrink-0">
        <div class="flex-1 min-w-0">
          <div class="flex justify-between gap-2"><strong class="font-titulo text-xl font-semibold">${esc(p.nome)}</strong><span class="font-medium whitespace-nowrap">${reais(p.preco * q)}</span></div>
          <div class="mt-2 flex items-center justify-between">
            <div class="inline-flex items-center border border-[#D8CBB7] rounded-full">
              <button type="button" data-acao="menos" data-id="${id}" class="w-9 h-9 text-lg" aria-label="Diminuir quantidade de ${esc(p.nome)}">−</button>
              <span class="w-6 text-center" aria-label="Quantidade">${q}</span>
              <button type="button" data-acao="mais" data-id="${id}" class="w-9 h-9 text-lg" aria-label="Aumentar quantidade de ${esc(p.nome)}">+</button>
            </div>
            <button type="button" data-acao="remover" data-id="${id}" class="text-sm underline underline-offset-4 text-tinta-suave hover:text-vinho">Remover</button>
          </div>
        </div>
      </li>`;
  }).join('');
  return cabecalhoSacola('Sua sacola') + `<div class="flex-1 overflow-y-auto px-5">
      <ul>${linhas}</ul>
      <div class="py-5">${htmlCalculadora()}</div>
    </div>
    <footer class="shrink-0 border-t border-areia px-5 py-4 bg-marfim">
      <div data-totais class="space-y-1">${htmlTotais()}</div>
      <p data-erro class="hidden text-sm text-vinho mt-2" role="alert"></p>
      <button type="button" data-acao="ir-dados" class="btn-principal w-full mt-3">Continuar</button>
    </footer>`;
}

function viewDados() {
  const c = cliente;
  const campo = (nome, rotulo, extra = '', classe = '') => `<label class="block ${classe}"><span class="block text-sm mb-1">${rotulo}</span><input class="campo" name="${nome}" value="${esc(c[nome])}" ${extra}></label>`;
  const envio = envioEscolhido();
  return cabecalhoSacola('Seus dados') + `<form id="form-dados" class="flex-1 flex flex-col min-h-0">
      <div class="flex-1 overflow-y-auto px-5 py-5 grid grid-cols-6 gap-3 content-start">
        ${campo('nome', 'Nome completo', 'required autocomplete="name"', 'col-span-6')}
        ${campo('telefone', 'WhatsApp com DDD', 'required type="tel" inputmode="tel" autocomplete="tel" placeholder="(00) 00000-0000"', 'col-span-6')}
        <p class="col-span-6 text-sm text-tinta-suave mt-2">Entrega no CEP <strong class="font-medium text-tinta">${esc(cepFormatado())}</strong>, envio ${esc(envio.nome)}. <button type="button" data-acao="voltar-sacola" class="underline underline-offset-2">Alterar</button></p>
        ${campo('logradouro', 'Rua', 'required autocomplete="address-line1"', 'col-span-6')}
        ${campo('numero', 'Número', 'required inputmode="numeric"', 'col-span-2')}
        ${campo('complemento', 'Complemento', 'autocomplete="address-line2"', 'col-span-4')}
        ${campo('bairro', 'Bairro', 'required', 'col-span-6')}
        ${campo('cidade', 'Cidade', 'required autocomplete="address-level2"', 'col-span-4')}
        <label class="block col-span-2"><span class="block text-sm mb-1">Estado</span><select class="campo" name="uf" required><option value=""></option>${UFS.map((u) => `<option ${u === (c.uf || entrega.uf) ? 'selected' : ''}>${u}</option>`).join('')}</select></label>
        <fieldset class="col-span-6 mt-2">
          <legend class="text-sm mb-1">Como prefere pagar?</legend>
          <div class="grid grid-cols-2 gap-2">
            ${['Pix', 'Cartão de crédito'].map((f) => `<label class="flex items-center gap-2 border border-[#D8CBB7] bg-white rounded-xl p-3 cursor-pointer"><input type="radio" name="pagamento" value="${f}" class="accent-[#7A1420]" ${c.pagamento === f ? 'checked' : ''}>${f}</label>`).join('')}
          </div>
          <p class="text-xs text-tinta-suave mt-2">Enviamos os dados de pagamento pelo WhatsApp. Nenhum dado de cartão é digitado aqui.</p>
        </fieldset>
        <label class="block col-span-6"><span class="block text-sm mb-1">Observações (opcional)</span><textarea class="campo" name="observacoes" rows="2" placeholder="É para presente? Prefere outra cor?">${esc(c.observacoes)}</textarea></label>
      </div>
      <footer class="shrink-0 border-t border-areia px-5 py-4 flex gap-2">
        <button type="button" data-acao="voltar-sacola" class="btn-contorno">Voltar</button>
        <button type="submit" class="btn-principal flex-1">Revisar pedido</button>
      </footer>
    </form>`;
}

function mensagemPedido() {
  const envio = envioEscolhido();
  const c = cliente;
  const linhas = Object.entries(itens).map(([id, q]) => `${q}x ${CONFIG.produtos[id].nome}: ${reais(CONFIG.produtos[id].preco * q)}`);
  return [
    'Olá, Sonhos RM! Quero finalizar meu pedido pelo site.',
    '',
    `*Pedido ${codigoPedido}*`,
    ...linhas,
    `Subtotal: ${reais(subtotal())}`,
    `Frete (${envio.nome}): ${reais(envio.valor)}`,
    `*Total: ${reais(subtotal() + envio.valor)}*`,
    `Previsão de entrega: até ${envio.chegada.toLocaleDateString('pt-BR')} (${envio.diasTotal} dias úteis)`,
    '',
    '*Entrega*',
    c.nome,
    `${c.logradouro}, ${c.numero}${c.complemento ? ', ' + c.complemento : ''}`,
    `${c.bairro}, ${c.cidade}/${c.uf}`,
    `CEP ${cepFormatado()}`,
    `WhatsApp: ${c.telefone}`,
    '',
    `Pagamento: ${c.pagamento}`,
    ...(c.observacoes ? [`Observações: ${c.observacoes}`] : [])
  ].join('\n');
}

function viewRevisao() {
  const envio = envioEscolhido();
  const c = cliente;
  const link = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(mensagemPedido());
  return cabecalhoSacola('Revise seu pedido') + `<div class="flex-1 overflow-y-auto px-5 py-5 space-y-5">
      <section>
        <h3 class="font-medium mb-2">Itens</h3>
        <ul class="space-y-1">${Object.entries(itens).map(([id, q]) => `<li class="flex justify-between gap-2"><span>${q}x ${esc(CONFIG.produtos[id].nome)}</span><span>${reais(CONFIG.produtos[id].preco * q)}</span></li>`).join('')}</ul>
      </section>
      <section>
        <h3 class="font-medium mb-2">Entrega ${esc(envio.nome)}</h3>
        <p class="text-tinta-suave leading-relaxed">${esc(c.nome)}<br>${esc(c.logradouro)}, ${esc(c.numero)}${c.complemento ? ', ' + esc(c.complemento) : ''}<br>${esc(c.bairro)}, ${esc(c.cidade)}/${esc(c.uf)}<br>CEP ${esc(cepFormatado())}</p>
        <p class="mt-2">Chega até <strong class="font-medium">${dataCurta(envio.chegada)}</strong> <span class="text-tinta-suave">(${CONFIG.diasProducao} de produção + ${envio.diasEnvio} de envio, em dias úteis)</span></p>
      </section>
      <section>
        <h3 class="font-medium mb-2">Pagamento</h3>
        <p class="text-tinta-suave">${esc(c.pagamento)}, com os dados de pagamento enviados pelo nosso WhatsApp.</p>
      </section>
    </div>
    <footer class="shrink-0 border-t border-areia px-5 py-4">
      <div class="space-y-1">${htmlTotais()}</div>
      <a href="${esc(link)}" target="_blank" rel="noopener" data-acao="enviar" class="btn-principal w-full mt-3"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>Enviar pedido pelo WhatsApp</a>
      <button type="button" data-acao="ir-dados" class="w-full mt-2 text-sm underline underline-offset-4 py-1">Voltar e editar</button>
    </footer>`;
}

function viewEnviado() {
  return cabecalhoSacola('Pedido criado') + `<div class="flex-1 flex flex-col items-center justify-center text-center p-8">
      <p class="font-script text-5xl text-ouro-texto">Obrigada!</p>
      <p class="mt-3 text-lg">Seu pedido <strong class="font-medium">${esc(codigoPedido)}</strong> foi aberto no WhatsApp.</p>
      <p class="mt-2 text-tinta-suave">É só tocar em enviar na conversa. Nós confirmamos os detalhes e enviamos os dados de pagamento.</p>
      <button type="button" data-acao="fechar-sacola" class="btn-contorno mt-6">Voltar para a loja</button>
    </div>`;
}

function renderSacola() {
  const views = { sacola: viewSacola, dados: viewDados, revisao: viewRevisao, enviado: viewEnviado };
  const dlg = $('#sacola');
  dlg.innerHTML = views[etapa]();
}

function atualizarContador() {
  const n = totalBolsas();
  const el = $('#contador');
  el.textContent = n;
  el.hidden = !n;
  el.style.display = n ? '' : 'none';
  $('[data-acao="abrir-sacola"]').setAttribute('aria-label', n ? `Abrir sacola, ${n} ${n > 1 ? 'bolsas' : 'bolsa'}` : 'Abrir sacola');
}

function aviso(texto) {
  const t = $('#toast');
  t.textContent = texto;
  t.classList.remove('opacity-0');
  clearTimeout(aviso.timer);
  aviso.timer = setTimeout(() => t.classList.add('opacity-0'), 2200);
}

function adicionar(id) {
  itens[id] = (itens[id] || 0) + 1;
  salvar();
  atualizarContador();
  atualizarCalculos();
}

function abrirSacola() {
  if (etapa === 'enviado' && totalBolsas()) etapa = 'sacola';
  renderSacola();
  if (!$('#sacola').open) $('#sacola').showModal();
}

/* ---------- Eventos ---------- */
document.addEventListener('click', (e) => {
  const alvo = e.target.closest('[data-acao]');
  if (e.target === $('#produto')) $('#produto').close();
  if (e.target === $('#sacola')) $('#sacola').close();
  if (!alvo) return;
  const { acao, id } = alvo.dataset;
  const refocar = (seletor) => { const el = $(seletor, $('#sacola')); if (el) el.focus(); };

  if (acao === 'abrir-produto') abrirProduto(id);
  if (acao === 'fechar-produto') $('#produto').close();
  if (acao === 'abrir-sacola') { etapa = etapa === 'enviado' ? 'sacola' : etapa; abrirSacola(); }
  if (acao === 'fechar-sacola') { $('#sacola').close(); if (etapa === 'enviado') etapa = 'sacola'; }
  if (acao === 'adicionar') {
    adicionar(id);
    if (etapa === 'enviado') etapa = 'sacola';
    aviso(CONFIG.produtos[id].nome + ' na sacola ♥');
  }
  if (acao === 'comprar') {
    adicionar(id);
    etapa = 'sacola';
    $('#produto').close();
    abrirSacola();
  }
  if (acao === 'mais' || acao === 'menos') {
    itens[id] = (itens[id] || 0) + (acao === 'mais' ? 1 : -1);
    if (itens[id] <= 0) delete itens[id];
    salvar(); atualizarContador(); renderSacola();
    refocar(`[data-acao="${acao}"][data-id="${id}"]`);
  }
  if (acao === 'remover') {
    delete itens[id];
    salvar(); atualizarContador(); renderSacola();
  }
  if (acao === 'ir-dados') {
    if (!envioEscolhido()) {
      const erro = $('[data-erro]');
      if (erro) { erro.textContent = 'Calcule o frete pelo CEP para continuar.'; erro.classList.remove('hidden'); }
      refocar('input[name=cep]');
      return;
    }
    etapa = 'dados';
    renderSacola();
  }
  if (acao === 'voltar-sacola') { lerFormulario(); etapa = 'sacola'; renderSacola(); }
  if (acao === 'enviar') {
    // O link abre o WhatsApp; a tela muda logo depois para não cancelar a abertura
    setTimeout(() => {
      itens = {};
      salvar();
      atualizarContador();
      etapa = 'enviado';
      renderSacola();
    }, 0);
  }
});

function lerFormulario() {
  const f = $('#form-dados');
  if (f) new FormData(f).forEach((v, k) => { cliente[k] = String(v).trim(); });
}

document.addEventListener('submit', (e) => {
  if (e.target.matches('[data-calc]')) {
    e.preventDefault();
    buscarCep(e.target.elements.cep.value);
  }
  if (e.target.id === 'form-dados') {
    e.preventDefault();
    lerFormulario();
    // Se a cliente trocou o estado, o frete segue o estado informado no endereço
    if (cliente.uf && cliente.uf !== entrega.uf) entrega.uf = cliente.uf;
    codigoPedido = codigoPedido || 'RM-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    etapa = 'revisao';
    renderSacola();
  }
});

document.addEventListener('input', (e) => {
  if (e.target.name === 'cep') {
    const d = e.target.value.replace(/\D/g, '').slice(0, 8);
    e.target.value = d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d;
    if (d.length === 8 && d !== entrega.cep) buscarCep(d);
  }
});

document.addEventListener('change', (e) => {
  if (e.target.matches('[data-envio]')) {
    entrega.envio = e.target.value;
    atualizarCalculos();
  }
  if (e.target.matches('[data-uf-manual]')) {
    entrega.uf = e.target.value;
    cliente.uf = e.target.value;
    atualizarCalculos();
  }
});

['#produto', '#sacola'].forEach((s) => {
  $(s).addEventListener('close', () => {
    document.documentElement.style.overflow = $('#produto').open || $('#sacola').open ? 'hidden' : '';
    if (s === '#sacola' && etapa === 'enviado') { etapa = 'sacola'; codigoPedido = ''; }
  });
  new MutationObserver(() => {
    if ($(s).open) document.documentElement.style.overflow = 'hidden';
  }).observe($(s), { attributes: true, attributeFilter: ['open'] });
});

/* ---------- Início ---------- */
$('#ano').textContent = new Date().getFullYear();
$$('[data-preco]').forEach((el) => { el.textContent = reais(CONFIG.produtos[el.dataset.preco].preco); });
$$('[data-texto-producao]').forEach((el) => { el.textContent = `São ${CONFIG.diasProducao} dias úteis até a sua bolsa ficar pronta.`; });
$$('[data-calc-host]').forEach((el) => { el.innerHTML = htmlCalculadora(); });
const dadosLoja = [CONFIG.documento, CONFIG.enderecoLoja].filter(Boolean).join(' · ');
if (dadosLoja) { $('#dados-loja').textContent = dadosLoja; $('#dados-loja').hidden = false; }
atualizarContador();

/* Menu mobile */
const botao = $('#menu-botao');
const menu = $('#menu-mobile');
const alternarMenu = (abrir) => {
  menu.classList.toggle('hidden', !abrir);
  botao.setAttribute('aria-expanded', String(abrir));
  botao.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
};
botao.addEventListener('click', () => alternarMenu(menu.classList.contains('hidden')));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) alternarMenu(false); });

/* Animação suave ao rolar */
const blocos = $$('.revelar');
if ('IntersectionObserver' in window) {
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visivel');
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.12 });
  blocos.forEach((b) => observador.observe(b));
} else {
  blocos.forEach((b) => b.classList.add('visivel'));
}
