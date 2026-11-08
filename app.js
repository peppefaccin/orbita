'use strict';
/* Órbita: tempo, tarefas e notas para quem trabalha com criação. Feito por Peppe Faccin. */
(() => {
  const CFG = window.ORBITA_CONFIG || {};
  const MODO_TESTE = !CFG.supabaseUrl;
  const CH = { dados: 'orbita.dados', ui: 'orbita.ui' };
  const SEM_CLIENTE = 'Sem cliente';
  const ABAS = [['timer', 'TIMER'], ['historico', 'HISTÓRICO'], ['tarefas', 'TAREFAS'], ['notas', 'NOTAS']];
  const PERIODOS = [['semana', 'Esta semana'], ['mes', 'Este mês'], ['mesPassado', 'Mês passado'], ['tudo', 'Tudo']];

  // ---------- nichos ----------
  const NICHOS = {
    fotografia: {
      nome: 'Fotografia', tipos: ['Ensaio', 'Evento', 'Tratamento', 'Produto'],
      sugestoes: ['Fazer backup do último ensaio', 'Mandar a galeria que está pendente', 'Separar 3 fotos para o portfólio',
        'Criar um preset com a cor do último trabalho', 'Limpar as lentes e carregar as baterias', 'Postar um antes e depois',
        'Pedir um depoimento ao último cliente', 'Revisar a tabela de preços'],
    },
    video: {
      nome: 'Vídeo e edição', tipos: ['Edição', 'Captação', 'Cor', 'Motion'],
      sugestoes: ['Organizar os brutos do último projeto', 'Limpar o cache do programa de edição', 'Mandar a prévia que está pendente',
        'Separar músicas para os próximos vídeos', 'Testar uma LUT nova num projeto antigo', 'Montar um reel com material parado',
        'Fazer backup dos projetos entregues', 'Salvar os presets de exportação'],
    },
    design: {
      nome: 'Design', tipos: ['Identidade', 'Social', 'Impresso', 'Revisão'],
      sugestoes: ['Organizar a pasta de fontes', 'Atualizar o portfólio', 'Transformar um layout repetido em template',
        'Postar o processo de um trabalho', 'Mandar a revisão que está pendente', 'Arquivar os projetos entregues',
        'Juntar referências para o próximo cliente', 'Revisar a tabela de preços'],
    },
    social: {
      nome: 'Social media', tipos: ['Conteúdo', 'Captação', 'Relatório', 'Atendimento'],
      sugestoes: ['Montar o calendário da semana', 'Fazer o relatório do mês', 'Responder directs e comentários',
        'Separar áudios em alta para os próximos posts', 'Agendar os posts da semana', 'Mandar a pauta para aprovação',
        'Ver os números do último post', 'Atualizar o banco de ideias'],
    },
    criador: {
      nome: 'Criador de conteúdo', tipos: ['Roteiro', 'Gravação', 'Edição', 'Postagem'],
      sugestoes: ['Escrever 3 ideias de roteiro', 'Gravar dois vídeos de uma vez', 'Responder os comentários do último post',
        'Separar áudios em alta', 'Editar o vídeo que está parado', 'Planejar os posts da semana',
        'Ver o que mais deu resultado no mês', 'Organizar os arquivos do celular'],
    },
    musica: {
      nome: 'Música e DJ', tipos: ['Produção', 'Mixagem', 'Ensaio', 'Show'],
      sugestoes: ['Organizar a biblioteca de músicas', 'Separar faixas novas para o próximo set', 'Fazer backup dos projetos',
        'Gravar um trecho para as redes', 'Mandar a divulgação do próximo show', 'Estudar uma técnica nova por 30 min',
        'Atualizar o press kit', 'Ouvir referências e anotar ideias'],
    },
    outro: {
      nome: 'Outro', tipos: ['Trabalho', 'Reunião', 'Estudo', 'Outro'],
      sugestoes: ['Conferir os prazos da semana', 'Responder as mensagens pendentes', 'Organizar a área de trabalho do computador',
        'Fazer backup dos arquivos importantes', 'Planejar o dia de amanhã', 'Estudar algo novo por 30 min'],
    },
  };
  const GERAIS = [
    ['Revisar os gastos da semana', 'Finanças'], ['Conferir pagamentos que ainda não caíram', 'Finanças'],
    ['Mandar um orçamento que está parado', 'Clientes'], ['Responder as mensagens de clientes', 'Clientes'],
    ['Esvaziar a pasta Downloads', 'Organização'], ['Conferir os prazos da semana', 'Organização'],
    ['Levantar, alongar e beber água', 'Saúde'], ['Sair para uma caminhada curta', 'Saúde'],
  ];

  // ---------- ícones ----------
  const svg = (w, corpo, extra = '') =>
    `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ${extra}>${corpo}</svg>`;
  const I = {
    play: '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>',
    pausa: '<svg width="22" height="22" viewBox="0 0 24 24"><rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor"/><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor"/></svg>',
    stop: '<svg width="18" height="18" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="1.5" fill="currentColor"/></svg>',
    mais: svg(12, '<path d="M12 5v14M5 12h14"/>', 'stroke-width="2"'),
    x: svg(12, '<path d="M6 6l12 12M18 6L6 18"/>'),
    check: svg(11, '<path d="M5 12.5l4.5 4.5L19 7.5"/>', 'stroke-width="3"'),
    lixo: svg(15, '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    girar: svg(11, '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/>', 'stroke-width="2"'),
    ajustes: svg(18, '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'),
    timer: svg(20, '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2.5h6"/>'),
    historico: svg(20, '<path d="M5 20V11M12 20V4M19 20v-7"/>'),
    tarefas: svg(20, '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>'),
    notas: svg(20, '<path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 15h7"/>'),
  };

  // ---------- utilidades ----------
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isoDe = (d) => new Date(Math.floor(d.getTime() / 1000) * 1000).toISOString().replace('.000Z', 'Z');
  const agoraISO = () => isoDe(new Date());
  const t = (s) => (s ? Date.parse(s) || 0 : 0);
  const pad = (n) => String(n).padStart(2, '0');
  const soma = (l) => l.reduce((a, s) => a + (s.segundos || 0), 0);
  const achar = (lista, id) => lista.find((x) => x.id === id);
  const lerJSON = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
  const gravarJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem espaço */ } };
  const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

  function novoId() {
    if (crypto.randomUUID) return crypto.randomUUID().toUpperCase();
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`.toUpperCase();
  }
  function relogio(s) {
    s = Math.max(0, Math.floor(s));
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  }
  function duracao(s) {
    const m = Math.round(s / 60);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60), r = m % 60;
    return r ? `${h}h ${pad(r)}` : `${h}h`;
  }
  const fmt = (d, op) => new Intl.DateTimeFormat('pt-BR', op).format(d).replace(/\./g, '');
  const hora = (iso) => fmt(new Date(iso), { hour: '2-digit', minute: '2-digit' });
  const mesmoDia = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const inicioDia = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  function dia(x) {
    const d = new Date(x), h = new Date(), o = new Date();
    o.setDate(o.getDate() - 1);
    if (mesmoDia(d, h)) return 'Hoje';
    if (mesmoDia(d, o)) return 'Ontem';
    return fmt(d, { weekday: 'long', day: 'numeric', month: 'long' });
  }
  function diaCurto(x) {
    const d = new Date(x), h = new Date(), o = new Date(), a = new Date();
    o.setDate(o.getDate() - 1); a.setDate(a.getDate() + 1);
    if (mesmoDia(d, h)) return 'Hoje';
    if (mesmoDia(d, o)) return 'Ontem';
    if (mesmoDia(d, a)) return 'Amanhã';
    return fmt(d, { day: 'numeric', month: 'short' });
  }
  const inputData = (iso) => { const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const inputDataHora = (iso) => { const d = new Date(iso); return `${inputData(iso)}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const deInputData = (v) => { const [y, m, d] = v.split('-').map(Number); return isoDe(new Date(y, m - 1, d, 12)); };

  function avisar(texto) {
    const a = $('#aviso');
    a.textContent = texto;
    a.classList.add('ver');
    clearTimeout(avisar.t);
    avisar.t = setTimeout(() => a.classList.remove('ver'), 2600);
  }
  function baixarArquivo(nome, conteudo, tipo) {
    const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
    const a = document.createElement('a');
    a.href = url; a.download = nome;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  // ---------- dados ----------
  function vazio() {
    return {
      versao: 1, sessoes: [], tarefas: [], notas: [], apagados: {},
      timer: { cliente: '', projeto: '', tipo: '', acumulado: 0, editado: '1970-01-01T00:00:00Z' },
      perfil: { nome: '', email: '', nicho: '', tipos: [], sugestoes: [], semGerais: false, novidades: false, editado: '1970-01-01T00:00:00Z' },
    };
  }
  function normalizarDados(d) {
    const v = vazio();
    d = d || {};
    return {
      ...v, ...d,
      sessoes: Array.isArray(d.sessoes) ? d.sessoes : [],
      tarefas: Array.isArray(d.tarefas) ? d.tarefas : [],
      notas: Array.isArray(d.notas) ? d.notas : [],
      apagados: d.apagados && typeof d.apagados === 'object' ? d.apagados : {},
      timer: { ...v.timer, ...(d.timer || {}) },
      perfil: { ...v.perfil, ...(d.perfil || {}) },
    };
  }

  let dados = normalizarDados(lerJSON(CH.dados));
  const ui = Object.assign(
    { aba: 'timer', periodo: 'mes', filtroCliente: '', notaSel: null, editandoNota: false, verFeitas: false, semente: 0, modal: null,
      entrada: { nome: '', email: '', nicho: '', novidades: false, erro: '' } },
    (({ aba, periodo }) => ({ ...(aba ? { aba } : {}), ...(periodo ? { periodo } : {}) }))(lerJSON(CH.ui) || {}),
  );

  const perfil = () => dados.perfil;
  const tipos = () => (perfil().tipos.length ? perfil().tipos : NICHOS.outro.tipos);
  const guardar = () => gravarJSON(CH.dados, dados);
  const guardarUI = () => gravarJSON(CH.ui, { aba: ui.aba, periodo: ui.periodo });
  function salvarLocal() { guardar(); }
  function mudou() { salvarLocal(); render(true); }
  function tocarPerfil() { dados.perfil.editado = agoraISO(); }

  function apagarItem(lista, id) {
    dados[lista] = dados[lista].filter((x) => x.id !== id);
    dados.apagados[id] = agoraISO();
  }
  function clientes() {
    const ev = [...dados.sessoes.map((s) => [t(s.inicio), s.cliente]), ...dados.tarefas.map((x) => [t(x.criada), x.cliente])]
      .sort((a, b) => b[0] - a[0]);
    const vistos = new Set(), lista = [];
    for (const [, c] of ev) {
      const n = (c || '').trim();
      if (!n || n === SEM_CLIENTE || vistos.has(n.toLowerCase())) continue;
      vistos.add(n.toLowerCase()); lista.push(n);
    }
    return lista;
  }

  // ---------- timer ----------
  function decorrido() {
    const tm = dados.timer;
    return (tm.acumulado || 0) + (tm.rodandoDesde ? Math.max(0, (Date.now() - t(tm.rodandoDesde)) / 1000) : 0);
  }
  function tocarTimer() { dados.timer.editado = agoraISO(); }
  function play() {
    const tm = dados.timer;
    if (tm.rodandoDesde) return;
    if (!tm.inicioSessao) tm.inicioSessao = agoraISO();
    if (!tm.tipo) tm.tipo = tipos()[0];
    tm.rodandoDesde = agoraISO();
    tocarTimer(); mudou();
  }
  function acumular() {
    const tm = dados.timer;
    if (!tm.rodandoDesde) return;
    tm.acumulado = (tm.acumulado || 0) + Math.max(0, (Date.now() - t(tm.rodandoDesde)) / 1000);
    delete tm.rodandoDesde;
  }
  function pausar() { acumular(); tocarTimer(); mudou(); }
  function limparTimer() {
    const tm = dados.timer;
    delete tm.inicioSessao; delete tm.rodandoDesde; delete tm.data;
    tm.acumulado = 0;
    tocarTimer();
  }
  function parar() {
    acumular();
    const tm = dados.timer;
    if (tm.inicioSessao && tm.acumulado >= 1) {
      const agora = agoraISO();
      dados.sessoes.push({
        id: novoId(), cliente: (tm.cliente || '').trim() || SEM_CLIENTE, projeto: (tm.projeto || '').trim(), tipo: tm.tipo || tipos()[0],
        data: tm.data || tm.inicioSessao, inicio: tm.inicioSessao, fim: agora, segundos: tm.acumulado, editado: agora,
      });
      avisar(`Salvo: ${duracao(tm.acumulado)}`);
    }
    limparTimer(); mudou();
  }
  function totalHoje() {
    const h = new Date(), tm = dados.timer;
    const base = soma(dados.sessoes.filter((s) => mesmoDia(new Date(s.data), h)));
    const timerHoje = tm.inicioSessao && mesmoDia(new Date(tm.data || tm.inicioSessao), h);
    return base + (timerHoje ? decorrido() : 0);
  }

  // ---------- tela de entrada ----------
  function vEntrada() {
    const e = ui.entrada;
    return `<div class="entrada-tela"><div class="entrada-caixa">
      <img class="simbolo-grande" src="simbolo.png" alt="">
      <h1 class="titulo-marca">ÓRBITA</h1>
      <p class="sub-marca">Marque o tempo de cada trabalho, anote o que falta fazer e veja quanto cada cliente rendeu no mês. Grátis.</p>
      <input class="campo" id="e-nome" placeholder="Seu nome" value="${esc(e.nome)}" autocomplete="given-name" autocapitalize="words">
      <input class="campo" id="e-email" type="email" placeholder="Seu e-mail" value="${esc(e.email)}" autocomplete="email" autocapitalize="off" spellcheck="false">
      <div class="bloco"><span class="rotulo">Com o que você trabalha?</span>
        <div class="chips">${Object.entries(NICHOS).map(([id, n]) => `<button class="chip ${e.nicho === id ? 'ativo' : ''}" data-acao="e-nicho" data-valor="${id}">${n.nome}</button>`).join('')}</div>
      </div>
      <label class="caixinha"><input type="checkbox" id="e-novidades" ${e.novidades ? 'checked' : ''}>
        <span>Quero receber e-mails do Peppe Faccin com novidades do Órbita, conteúdos e produtos. Dá para sair quando quiser.</span></label>
      ${e.erro ? `<p class="erro-campo">${esc(e.erro)}</p>` : ''}
      <button class="botao cheio largo" data-acao="entrar">ENTRAR</button>
      ${MODO_TESTE ? '<p class="aviso-teste">Versão de teste: seus dados ficam só neste aparelho.</p>' : ''}
      <p class="credito">Feito por <a href="${esc(CFG.instagram)}" target="_blank" rel="noopener">Peppe Faccin</a> · <a href="privacidade.html">Privacidade</a></p>
    </div></div>`;
  }
  function lerEntrada() {
    const e = ui.entrada;
    if ($('#e-nome')) e.nome = $('#e-nome').value;
    if ($('#e-email')) e.email = $('#e-email').value.trim();
    if ($('#e-novidades')) e.novidades = $('#e-novidades').checked;
  }
  function entrar() {
    lerEntrada();
    const e = ui.entrada;
    if (!e.nome.trim()) e.erro = 'Escreva seu nome.';
    else if (!emailValido(e.email)) e.erro = 'Confira o e-mail.';
    else if (!e.nicho) e.erro = 'Escolha com o que você trabalha.';
    else e.erro = '';
    if (e.erro) { render(true); return; }
    const n = NICHOS[e.nicho];
    const p = dados.perfil;
    p.nome = e.nome.trim();
    p.email = e.email.toLowerCase();
    p.novidades = e.novidades;
    if (p.nicho !== e.nicho || !p.tipos.length) { p.nicho = e.nicho; p.tipos = [...n.tipos]; }
    p.criado = p.criado || agoraISO();
    tocarPerfil();
    if (!dados.timer.tipo || !p.tipos.includes(dados.timer.tipo)) dados.timer.tipo = p.tipos[0];
    ui.aba = 'timer';
    guardarUI();
    mudou();
    avisar(`Bem-vindo, ${p.nome.split(' ')[0]}`);
  }

  // ---------- telas ----------
  function vSessao(s) {
    return `<button class="sessao" data-acao="editar-sessao" data-id="${esc(s.id)}">
      <span class="hora num">${hora(s.inicio)}–${hora(s.fim)}</span>
      <span style="min-width:0"><span class="cli">${esc(s.cliente)}</span><span class="sub">${esc([s.tipo, s.projeto].filter(Boolean).join(' · '))}</span></span>
      <span class="dur num">${duracao(s.segundos)}</span></button>`;
  }
  function vHoje() {
    const h = new Date();
    const hoje = dados.sessoes.filter((s) => mesmoDia(new Date(s.data), h)).sort((a, b) => t(b.inicio) - t(a.inicio));
    return `<div class="cabeca-lateral"><span class="rotulo">Hoje</span><span class="total-hoje num" data-total-hoje>${duracao(totalHoje())}</span></div>
      ${hoje.length ? hoje.map(vSessao).join('') : '<p class="dica">Nenhum tempo salvo hoje ainda.</p>'}`;
  }
  function vTimer() {
    const tm = dados.timer, ativo = !!tm.inicioSessao, rod = !!tm.rodandoDesde;
    const atual = (tm.cliente || '').trim().toLowerCase();
    const outros = clientes().filter((c) => c.toLowerCase() !== atual).slice(0, 8);
    const tipoAtual = tm.tipo || tipos()[0];
    const status = rod ? 'Gravando' : ativo ? 'Pausado' : 'Pronto para começar';
    return `<div class="duas"><section class="principal"><div class="pilha">
      <div>
        <div class="status"><span class="ponto" data-ponto></span><span class="rotulo">${status}</span></div>
        <div class="relogio-grande num" data-relogio>${relogio(decorrido())}</div>
        <div class="botoes">
          <button class="redondo cheio" data-acao="alternar" aria-label="${rod ? 'Pausar' : 'Começar'}">${rod ? I.pausa : I.play}</button>
          <button class="redondo" data-acao="parar" ${ativo ? '' : 'disabled'} aria-label="Parar e salvar">${I.stop}</button>
          ${ativo ? `<button class="botao" data-acao="descartar">DESCARTAR</button><span class="comecou">começou às ${hora(tm.inicioSessao)}</span>` : ''}
        </div>
      </div>
      <hr class="linha-h">
      <div class="bloco"><span class="rotulo">Cliente</span>
        <input class="campo grande" data-campo="timer-cliente" placeholder="Nome do cliente" value="${esc(tm.cliente)}" autocomplete="off" autocapitalize="words">
        ${outros.length ? `<div class="chips">${outros.map((c) => `<button class="chip" data-acao="cliente-chip" data-valor="${esc(c)}">${esc(c)}</button>`).join('')}</div>` : ''}
      </div>
      <div class="bloco"><span class="rotulo">Projeto</span>
        <input class="campo" data-campo="timer-projeto" placeholder="Ex.: ensaio de casamento, reels do mês" value="${esc(tm.projeto)}" autocomplete="off">
      </div>
      <div class="linha-tipo-dia">
        <div class="bloco"><span class="rotulo">Tipo</span><div class="chips">${tipos().map((tp) => `<button class="chip ${tipoAtual === tp ? 'ativo' : ''}" data-acao="tipo" data-valor="${esc(tp)}">${esc(tp)}</button>`).join('')}</div></div>
        <div class="bloco"><span class="rotulo">Dia</span><input type="date" class="campo-data" data-campo="timer-data" value="${inputData(tm.data || tm.inicioSessao || agoraISO())}"></div>
      </div>
    </div></section><aside class="lateral">${vHoje()}</aside></div>`;
  }

  function intervalo(p) {
    const h = new Date();
    if (p === 'semana') {
      const d = inicioDia(h);
      d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      const f = new Date(d); f.setDate(f.getDate() + 7);
      return [d, f];
    }
    if (p === 'mes') return [new Date(h.getFullYear(), h.getMonth(), 1), new Date(h.getFullYear(), h.getMonth() + 1, 1)];
    if (p === 'mesPassado') return [new Date(h.getFullYear(), h.getMonth() - 1, 1), new Date(h.getFullYear(), h.getMonth(), 1)];
    return null;
  }
  function filtradas() {
    const iv = intervalo(ui.periodo);
    return dados.sessoes
      .filter((s) => { const d = new Date(s.data); return (!iv || (d >= iv[0] && d < iv[1])) && (!ui.filtroCliente || s.cliente === ui.filtroCliente); })
      .sort((a, b) => t(b.inicio) - t(a.inicio));
  }
  function agrupaSoma(lista, chave) {
    const m = new Map();
    for (const s of lista) m.set(chave(s), (m.get(chave(s)) || 0) + (s.segundos || 0));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }
  function vResumo(lista) {
    const total = soma(lista);
    const dias = new Set(lista.map((s) => inicioDia(new Date(s.data)).getTime())).size;
    const barras = (arr) => arr.map(([n, seg]) => `<div class="barra-resumo"><div class="topo-barra"><span>${esc(n)}</span><span class="num">${duracao(seg)}</span></div>
      <div class="trilho"><div class="cheia" style="width:${total ? ((seg / total) * 100).toFixed(1) : 0}%"></div></div></div>`).join('');
    return `<div class="acoes"><button class="botao cheio" data-acao="lancar">+ LANÇAR TEMPO</button>
        <button class="botao" data-acao="exportar" ${lista.length ? '' : 'disabled'}>EXPORTAR</button></div>
      <span class="rotulo">Total</span><p class="total-grande num">${duracao(total)}</p>
      <p class="dica">${lista.length} ${lista.length === 1 ? 'sessão' : 'sessões'} · ${dias} ${dias === 1 ? 'dia' : 'dias'}${dias ? ` · média ${duracao(total / dias)}/dia` : ''}</p>
      ${lista.length ? `<hr class="linha-h sep-resumo"><div class="rotulo" style="margin-bottom:14px">Por cliente</div>${barras(agrupaSoma(lista, (s) => s.cliente))}
      <hr class="linha-h sep-resumo"><div class="rotulo" style="margin-bottom:14px">Por tipo</div>${barras(agrupaSoma(lista, (s) => s.tipo))}` : ''}`;
  }
  function vHistorico() {
    const lista = filtradas();
    const grupos = new Map();
    for (const s of lista) {
      const k = inicioDia(new Date(s.data)).getTime();
      if (!grupos.has(k)) grupos.set(k, []);
      grupos.get(k).push(s);
    }
    const todos = [...new Set(dados.sessoes.map((s) => s.cliente))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const filtros = `<div class="filtros"><div class="chips">${PERIODOS.map(([id, nome]) => `<button class="chip ${ui.periodo === id ? 'ativo' : ''}" data-acao="periodo" data-valor="${id}">${nome}</button>`).join('')}</div>
      <select class="campo-data" data-campo="filtro-cliente"><option value="">Todos os clientes</option>${todos.map((c) => `<option value="${esc(c)}" ${c === ui.filtroCliente ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>`;
    const corpo = lista.length
      ? `<div class="lista-hist">${[...grupos.entries()].map(([k, ss]) => `<div class="cabeca-dia"><span class="rotulo">${esc(dia(k))}</span><span class="num">${duracao(soma(ss))}</span></div>${ss.map(vSessao).join('')}`).join('')}</div>`
      : '<div style="padding:40px 36px"><p class="vazio-titulo">Nada por aqui.</p><p class="vazio-texto">Use o timer ou “+ Lançar tempo” para registrar um trabalho.</p></div>';
    return `<div class="duas"><section style="min-width:0">${filtros}${corpo}</section><aside class="lateral">${vResumo(lista)}</aside></div>`;
  }

  function tarefasAbertas() {
    return dados.tarefas.filter((x) => !x.feita).sort((a, b) => {
      if (a.prazo && b.prazo) return t(a.prazo) - t(b.prazo);
      if (a.prazo) return -1;
      if (b.prazo) return 1;
      return t(b.criada) - t(a.criada);
    });
  }
  function vTarefa(x) {
    const atrasada = x.prazo && !x.feita && new Date(x.prazo) < inicioDia(new Date());
    return `<div class="tarefa ${x.feita ? 'feita' : ''}">
      <button class="check ${x.feita ? 'feito' : ''}" data-acao="toggle-tarefa" data-id="${esc(x.id)}" aria-label="Marcar como feita">${x.feita ? I.check : ''}</button>
      <input class="texto" data-campo="tarefa-texto" data-id="${esc(x.id)}" value="${esc(x.texto)}">
      ${x.cliente || (x.prazo && !x.feita) ? `<span class="meta">
        ${x.cliente ? `<span class="etiqueta">${esc(x.cliente)}</span>` : ''}
        ${x.prazo && !x.feita ? `<span class="prazo ${atrasada ? 'atrasada' : ''}">${atrasada ? 'atrasada · ' : ''}${diaCurto(x.prazo)}</span>` : ''}</span>` : ''}
      <button class="apagar" data-acao="apagar-tarefa" data-id="${esc(x.id)}" aria-label="Apagar">${I.x}</button></div>`;
  }

  function sorteio(a) {
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let z = Math.imul(a ^ (a >>> 15), 1 | a);
      z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
      return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
    };
  }
  function embaralhar(lista, rnd) {
    for (let i = lista.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [lista[i], lista[j]] = [lista[j], lista[i]]; }
    return lista;
  }
  function sugestoes() {
    const h = new Date(), p = perfil();
    const abertas = new Set(dados.tarefas.filter((x) => !x.feita).map((x) => x.texto.toLowerCase()));
    const doDados = [];
    const [iniMes, fimMes] = intervalo('mes');
    const porCli = new Map();
    for (const s of dados.sessoes) {
      const d = new Date(s.data);
      if (d >= iniMes && d < fimMes && s.cliente !== SEM_CLIENTE) porCli.set(s.cliente, (porCli.get(s.cliente) || 0) + s.segundos);
    }
    [...porCli.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).filter(([, seg]) => seg >= 3600)
      .forEach(([c, seg]) => doDados.push({ texto: `Conferir as horas e cobrar ${c}`, motivo: `${duracao(seg)} registradas este mês`, cliente: c }));
    const ult = new Map();
    for (const s of dados.sessoes) if (s.cliente !== SEM_CLIENTE && t(s.data) > (ult.get(s.cliente) || 0)) ult.set(s.cliente, t(s.data));
    [...ult.entries()].sort((a, b) => b[1] - a[1]).forEach(([c, d]) => {
      const dias = Math.floor((Date.now() - d) / 86400000);
      if (dias >= 21) doDados.push({ texto: `Mandar mensagem para ${c}`, motivo: `Último trabalho há ${dias} dias`, cliente: c });
    });
    const atrasadas = dados.tarefas.filter((x) => !x.feita && x.prazo && new Date(x.prazo) < inicioDia(h)).length;
    if (atrasadas) doDados.unshift({ texto: atrasadas === 1 ? 'Resolver a tarefa atrasada' : `Rever as ${atrasadas} tarefas atrasadas`, motivo: 'Prazos', cliente: '' });

    const rnd = sorteio(Math.floor(inicioDia(h).getTime() / 86400000) * 7919 + ui.semente * 104729);
    const minhas = embaralhar(p.sugestoes.map((texto) => ({ texto, motivo: 'Sua lista', cliente: '' })), rnd);
    const doNicho = embaralhar(((NICHOS[p.nicho] || NICHOS.outro).sugestoes).map((texto) => ({ texto, motivo: (NICHOS[p.nicho] || NICHOS.outro).nome, cliente: '' })), rnd);
    const gerais = p.semGerais ? [] : embaralhar(GERAIS.map(([texto, motivo]) => ({ texto, motivo, cliente: '' })), rnd);

    const lista = [], usados = new Set();
    const pode = (s) => !abertas.has(s.texto.toLowerCase()) && !usados.has(s.texto);
    const por = (fonte, limite) => { for (const s of fonte) if (pode(s) && lista.length < limite) { lista.push(s); usados.add(s.texto); } };
    por(doDados.map((_, i) => doDados[(i + ui.semente) % doDados.length]), 2);
    por(minhas, lista.length + 2);
    por(doNicho, lista.length + 3);
    // completa até 7 misturando o que sobrou
    por(embaralhar([...minhas, ...doNicho, ...gerais], rnd), 7);
    return lista;
  }

  function vTarefas() {
    const abertas = tarefasAbertas();
    const feitas = dados.tarefas.filter((x) => x.feita).sort((a, b) => t(b.feitaEm) - t(a.feitaEm));
    return `<div class="duas"><section style="min-width:0">
      <div class="entrada">
        <input class="campo campo-tarefa" style="font-size:20px" id="nova-tarefa" placeholder="Nova tarefa…" data-enter="add-tarefa" autocomplete="off">
        <input class="campo campo-cliente" id="nova-cliente" placeholder="Cliente (opcional)" list="lista-clientes" data-enter="add-tarefa" autocomplete="off">
        <datalist id="lista-clientes">${clientes().map((c) => `<option value="${esc(c)}">`).join('')}</datalist>
        <input type="date" class="campo-data" id="nova-prazo" title="Prazo (opcional)" aria-label="Prazo">
        <button class="botao cheio" data-acao="add-tarefa">ADICIONAR</button>
      </div>
      <div class="lista-tarefas">
        ${abertas.length ? '' : '<div style="padding:26px 0"><p class="vazio-titulo">Nada pendente.</p><p class="vazio-texto">Escreva uma tarefa acima ou pegue uma das sugestões.</p></div>'}
        ${abertas.map(vTarefa).join('')}
        ${feitas.length ? `<button class="feitas-toggle" data-acao="ver-feitas"><span style="color:var(--apagado);font-size:10px">${ui.verFeitas ? '▼' : '▶'}</span><span class="rotulo">Feitas (${feitas.length})</span></button>
          ${ui.verFeitas ? feitas.map(vTarefa).join('') + '<div style="margin-top:16px"><button class="botao" data-acao="limpar-feitas">LIMPAR FEITAS</button></div>' : ''}` : ''}
      </div></section>
      <aside class="lateral">
        <div class="cabeca-sug"><span class="rotulo">Sugestões</span><button class="outras" data-acao="outras">${I.girar}OUTRAS</button></div>
        <p class="dica" style="color:var(--fraco);margin-bottom:10px">Toque para virar tarefa. Dá para mudar a lista em Ajustes.</p><hr class="linha-h">
        ${sugestoes().map((s) => `<button class="sugestao" data-acao="sugestao" data-texto="${esc(s.texto)}" data-cliente="${esc(s.cliente)}">
          <span class="mais">${I.mais}</span><span><span class="t" style="display:block">${esc(s.texto)}</span><span class="m" style="display:block">${esc(s.motivo)}</span></span></button>`).join('')}
      </aside></div>`;
  }

  const titulo = (n) => ((n.texto || '').split('\n').map((l) => l.trim()).find(Boolean) || 'Nota nova').slice(0, 60);
  function vNotas() {
    const notas = [...dados.notas].sort((a, b) => t(b.editada) - t(a.editada));
    if (!ui.notaSel || !achar(notas, ui.notaSel)) { ui.notaSel = notas[0] ? notas[0].id : null; if (!ui.notaSel) ui.editandoNota = false; }
    const sel = achar(notas, ui.notaSel);
    return `<div class="notas ${ui.editandoNota ? 'editando' : ''}">
      <section class="notas-lista">
        <div class="notas-cabeca"><span class="rotulo">Notas</span><button class="circulo" data-acao="nova-nota" aria-label="Nova nota">${I.mais}</button></div>
        ${notas.map((n) => `<button class="nota-item ${n.id === ui.notaSel ? 'sel' : ''}" data-acao="abrir-nota" data-id="${esc(n.id)}">
          <span class="t" style="display:block">${esc(titulo(n))}</span><span class="d" style="display:block">${diaCurto(n.editada)} · ${hora(n.editada)}</span></button>`).join('')}
        ${notas.length ? '' : '<div style="padding:24px 20px"><p class="vazio-titulo">Nenhuma nota ainda.</p><p class="vazio-texto">Toque no + para escrever uma ideia, um roteiro, uma lista.</p></div>'}
      </section>
      <section class="nota-editor">${sel
        ? `<div class="barra"><button class="voltar" data-acao="voltar-notas">‹ Notas</button>
            <span class="rotulo">Editada ${diaCurto(sel.editada).toLowerCase()} às ${hora(sel.editada)}</span>
            <button class="apagar" data-acao="apagar-nota" data-id="${esc(sel.id)}" aria-label="Apagar nota">${I.lixo}</button></div>
           <textarea data-campo="nota-texto" data-id="${esc(sel.id)}" placeholder="Escreva aqui…">${esc(sel.texto)}</textarea>`
        : '<div><p class="vazio-titulo">Nenhuma nota ainda.</p><p class="vazio-texto">Clique no + para escrever uma ideia, um roteiro, uma lista.</p></div>'}
      </section></div>`;
  }

  function vAjustes() {
    const p = perfil();
    return `<div class="ajustes">
      <div class="bloco"><span class="rotulo">Seu perfil</span>
        <input class="campo" data-campo="perfil-nome" placeholder="Seu nome" value="${esc(p.nome)}" autocapitalize="words">
        <p class="dica">${esc(p.email)}</p>
        <label class="caixinha"><input type="checkbox" data-campo="perfil-novidades" ${p.novidades ? 'checked' : ''}>
          <span>Receber e-mails do Peppe Faccin com novidades, conteúdos e produtos.</span></label>
      </div>
      <hr class="linha-h">
      <div class="bloco"><span class="rotulo">Com o que você trabalha</span>
        <div class="chips">${Object.entries(NICHOS).map(([id, n]) => `<button class="chip ${p.nicho === id ? 'ativo' : ''}" data-acao="nicho" data-valor="${id}">${n.nome}</button>`).join('')}</div>
        <p class="dica">Muda as sugestões de tarefas. Os tipos de trabalho abaixo só mudam se você pedir.</p>
      </div>
      <hr class="linha-h">
      <div class="bloco"><span class="rotulo">Tipos de trabalho (aparecem no timer)</span>
        <div class="chips">${tipos().map((tp) => `<button class="chip" data-acao="tirar-tipo" data-valor="${esc(tp)}" aria-label="Tirar ${esc(tp)}">${esc(tp)}<span class="tirar">×</span></button>`).join('')}</div>
        <div class="add-linha"><input class="campo" id="novo-tipo" placeholder="Novo tipo, ex.: Casamento" data-enter="add-tipo" autocomplete="off">
          <button class="botao" data-acao="add-tipo">ADICIONAR</button></div>
        ${p.nicho ? '<div><button class="botao" data-acao="tipos-do-nicho">USAR OS TIPOS DO NICHO</button></div>' : ''}
      </div>
      <hr class="linha-h">
      <div class="bloco"><span class="rotulo">Suas sugestões</span>
        <p class="dica">Coisas que você quer lembrar de fazer de vez em quando. Elas aparecem misturadas nas sugestões das tarefas.</p>
        <div class="lista-edit">${p.sugestoes.map((s, i) => `<div class="item-edit"><span>${esc(s)}</span><button class="apagar" style="opacity:1" data-acao="tirar-sugestao" data-valor="${i}" aria-label="Tirar">${I.x}</button></div>`).join('')}</div>
        <div class="add-linha"><input class="campo" id="nova-sugestao" placeholder="Ex.: Postar um bastidor" data-enter="add-sugestao" autocomplete="off">
          <button class="botao" data-acao="add-sugestao">ADICIONAR</button></div>
        <label class="caixinha"><input type="checkbox" data-campo="perfil-gerais" ${p.semGerais ? '' : 'checked'}>
          <span>Mostrar também sugestões gerais (finanças, clientes, organização, saúde)</span></label>
      </div>
      <hr class="linha-h">
      <div class="bloco"><span class="rotulo">No celular</span>
        <p class="dica">No iPhone: abra no Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”. No Android: menu do Chrome e “Instalar app”.</p></div>
      <hr class="linha-h">
      <div class="bloco"><span class="rotulo">Seus dados</span>
        ${MODO_TESTE ? '<p class="dica">Versão de teste: tudo fica só neste aparelho.</p>' : ''}
        <div class="acoes" style="margin:0"><button class="botao" data-acao="baixar-backup">BAIXAR CÓPIA (.JSON)</button><button class="botao" data-acao="sair">SAIR</button></div>
      </div>
      <p class="credito rodape-credito">Órbita · feito por <a href="${esc(CFG.instagram)}" target="_blank" rel="noopener">Peppe Faccin</a> · <a href="privacidade.html">Privacidade</a></p>
    </div>`;
  }

  // ---------- desenhar ----------
  let renderPendente = false;
  const focoEmCampo = () => {
    const a = document.activeElement;
    return !!a && $('#conteudo').contains(a) && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);
  };
  function renderAbas() {
    const topo = ABAS.map(([id, nome]) => `<button class="aba ${ui.aba === id ? 'ativa' : ''}" data-aba="${id}">${nome}</button>`).join('');
    if ($('#abas-topo').innerHTML !== topo) $('#abas-topo').innerHTML = topo;
    const baixo = [...ABAS, ['ajustes', 'AJUSTES']].map(([id, nome]) => `<button class="aba ${ui.aba === id ? 'ativa' : ''}" data-aba="${id}">${I[id]}${nome}</button>`).join('');
    if ($('#abas-baixo').innerHTML !== baixo) $('#abas-baixo').innerHTML = baixo;
  }
  function renderCanto() {
    const tm = dados.timer;
    let h;
    if (tm.inicioSessao) {
      h = `<div><div class="linha1"><span class="ponto" data-ponto style="width:7px;height:7px"></span><span class="num" data-relogio>${relogio(decorrido())}</span></div>
        <div class="linha2">${esc((tm.cliente || '').trim() || SEM_CLIENTE)}</div></div>`;
    } else {
      const d = new Date();
      h = `<div><div class="linha2" style="letter-spacing:2px">${fmt(d, { weekday: 'long' })}</div><div class="linha1">${fmt(d, { day: 'numeric', month: 'long' })}</div></div>`;
    }
    h += `<button class="engrenagem" data-aba="ajustes" aria-label="Ajustes">${I.ajustes}</button>`;
    $('#canto').innerHTML = h;
  }
  const TELAS = { timer: vTimer, historico: vHistorico, tarefas: vTarefas, notas: vNotas, ajustes: vAjustes };
  const logado = () => !!perfil().email;
  function render(forcar) {
    if (!forcar && focoEmCampo()) { renderPendente = true; atualizarRelogios(); return; }
    renderPendente = false;
    document.body.classList.toggle('entrando', !logado());
    if (!logado()) { $('#conteudo').innerHTML = vEntrada(); return; }
    renderAbas();
    renderCanto();
    $('#conteudo').innerHTML = (TELAS[ui.aba] || vTimer)();
    atualizarRelogios();
  }
  function atualizarRelogios() {
    const s = relogio(decorrido());
    document.querySelectorAll('[data-relogio]').forEach((e) => { if (e.textContent !== s) e.textContent = s; });
    const tm = dados.timer, rod = !!tm.rodandoDesde, ativo = !!tm.inicioSessao;
    const apagado = rod && Math.floor(Date.now() / 1000) % 2 === 1;
    document.querySelectorAll('[data-ponto]').forEach((e) => {
      e.classList.toggle('rodando', rod);
      e.classList.toggle('ativo', ativo && !rod);
      e.classList.toggle('apagado', apagado);
    });
    const th = document.querySelector('[data-total-hoje]');
    if (th) th.textContent = duracao(totalHoje());
    document.title = ativo ? `${s} · Órbita` : 'Órbita';
  }
  function irPara(aba) {
    ui.aba = aba;
    if (aba !== 'notas') ui.editandoNota = false;
    guardarUI();
    render(true);
    window.scrollTo(0, 0);
  }

  // ---------- editor de tempo ----------
  function abrirEditor(s, nova) {
    const m = Math.round((s.segundos || 0) / 60);
    ui.modal = { s: { ...s }, nova, minOrig: m };
    const lista = tipos().includes(s.tipo) || !s.tipo ? tipos() : [...tipos(), s.tipo];
    $('#modal').innerHTML = `<div class="fundo-modal" data-acao="fechar-fundo"><div class="caixa-modal" role="dialog" aria-modal="true">
      <h2>${nova ? 'Lançar tempo' : 'Editar tempo'}</h2>
      <div class="bloco"><span class="rotulo">Cliente</span><input class="campo" id="m-cliente" value="${esc(s.cliente)}" list="m-clientes" autocomplete="off">
        <datalist id="m-clientes">${clientes().map((c) => `<option value="${esc(c)}">`).join('')}</datalist></div>
      <div class="bloco"><span class="rotulo">Projeto</span><input class="campo" id="m-projeto" value="${esc(s.projeto)}" autocomplete="off"></div>
      <div class="bloco"><span class="rotulo">Tipo</span><div class="chips">${lista.map((tp) => `<button class="chip ${s.tipo === tp ? 'ativo' : ''}" data-acao="m-tipo" data-valor="${esc(tp)}">${esc(tp)}</button>`).join('')}</div></div>
      <div class="linha-tipo-dia" style="gap:28px">
        <div class="bloco"><span class="rotulo">Começou</span><input type="datetime-local" class="campo-data" id="m-inicio" value="${inputDataHora(s.inicio)}"></div>
        <div class="bloco"><span class="rotulo">Duração</span><div class="duracao">
          <input type="number" min="0" inputmode="numeric" class="campo-data" id="m-h" value="${Math.floor(m / 60)}"> h
          <input type="number" min="0" max="59" inputmode="numeric" class="campo-data" id="m-m" value="${m % 60}"> min</div></div>
      </div>
      <div class="rodape-modal">${nova ? '' : '<button class="botao" data-acao="apagar-modal">APAGAR</button>'}<span class="espaco"></span>
        <button class="botao" data-acao="fechar-modal">CANCELAR</button><button class="botao cheio" data-acao="salvar-modal">SALVAR</button></div>
    </div></div>`;
  }
  function fecharModal() { ui.modal = null; $('#modal').innerHTML = ''; }
  function salvarModal() {
    const { s, nova, minOrig } = ui.modal;
    const total = Math.max(0, parseInt($('#m-h').value, 10) || 0) * 60 + Math.max(0, parseInt($('#m-m').value, 10) || 0);
    if (nova || total !== minOrig) s.segundos = total * 60;
    const ini = $('#m-inicio').value ? new Date($('#m-inicio').value) : new Date(s.inicio);
    s.inicio = isoDe(ini);
    s.fim = isoDe(new Date(ini.getTime() + s.segundos * 1000));
    s.data = s.inicio;
    s.cliente = $('#m-cliente').value.trim() || SEM_CLIENTE;
    s.projeto = $('#m-projeto').value.trim();
    s.editado = agoraISO();
    const i = dados.sessoes.findIndex((x) => x.id === s.id);
    if (i >= 0) dados.sessoes[i] = s; else dados.sessoes.push(s);
    fecharModal();
    mudou();
  }

  function adicionarTarefa(texto, cliente, prazo) {
    texto = (texto || '').trim();
    if (!texto) return false;
    const agora = agoraISO();
    const x = { id: novoId(), texto, cliente: (cliente || '').trim(), feita: false, criada: agora, editado: agora };
    if (prazo) x.prazo = prazo;
    dados.tarefas.push(x);
    return true;
  }
  function exportarCSV(lista) {
    const h = (s) => (s / 3600).toFixed(2).replace('.', ',');
    const q = (s) => `"${String(s || '').replace(/"/g, '""')}"`;
    const linhas = ['Data;Cliente;Projeto;Tipo;Início;Fim;Horas;Duração'];
    for (const s of [...lista].sort((a, b) => t(a.inicio) - t(b.inicio))) {
      linhas.push([fmt(new Date(s.data), { day: '2-digit', month: '2-digit', year: 'numeric' }), q(s.cliente), q(s.projeto), q(s.tipo),
        hora(s.inicio), hora(s.fim), h(s.segundos), relogio(s.segundos)].join(';'));
    }
    const tot = soma(lista);
    linhas.push(`;;;;;Total;${h(tot)};${relogio(tot)}`);
    const nomeP = (PERIODOS.find((p) => p[0] === ui.periodo) || ['', ''])[1].toLowerCase();
    baixarArquivo(`horas - ${nomeP}${ui.filtroCliente ? ' - ' + ui.filtroCliente : ''}.csv`, '﻿' + linhas.join('\n'), 'text/csv;charset=utf-8');
  }

  // ---------- eventos ----------
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-acao],[data-aba]');
    if (!el) return;
    if (el.dataset.aba) { irPara(el.dataset.aba); return; }
    const id = el.dataset.id, v = el.dataset.valor;
    const p = perfil();
    switch (el.dataset.acao) {
      // entrada
      case 'e-nicho': lerEntrada(); ui.entrada.nicho = v; ui.entrada.erro = ''; render(true); break;
      case 'entrar': entrar(); break;
      // timer
      case 'alternar': dados.timer.rodandoDesde ? pausar() : play(); break;
      case 'parar': parar(); break;
      case 'descartar': if (confirm('Descartar este tempo? Ele não vai ser salvo.')) { acumular(); limparTimer(); mudou(); } break;
      case 'cliente-chip': dados.timer.cliente = v; tocarTimer(); mudou(); break;
      case 'tipo': dados.timer.tipo = v; tocarTimer(); mudou(); break;
      // histórico
      case 'periodo': ui.periodo = v; guardarUI(); render(true); break;
      case 'editar-sessao': { const s = achar(dados.sessoes, id); if (s) abrirEditor(s, false); break; }
      case 'lancar': {
        const fim = new Date(), ini = new Date(fim.getTime() - 3600000);
        abrirEditor({ id: novoId(), cliente: ui.filtroCliente || clientes()[0] || '', projeto: '', tipo: dados.timer.tipo || tipos()[0],
          data: isoDe(ini), inicio: isoDe(ini), fim: isoDe(fim), segundos: 3600 }, true);
        break;
      }
      case 'exportar': exportarCSV(filtradas()); break;
      case 'm-tipo':
        if (ui.modal) { ui.modal.s.tipo = v; el.parentElement.querySelectorAll('.chip').forEach((c) => c.classList.toggle('ativo', c === el)); }
        break;
      case 'salvar-modal': salvarModal(); break;
      case 'fechar-modal': fecharModal(); break;
      case 'fechar-fundo': if (e.target === el) fecharModal(); break;
      case 'apagar-modal':
        if (ui.modal && confirm('Apagar este tempo?')) { apagarItem('sessoes', ui.modal.s.id); fecharModal(); mudou(); }
        break;
      // tarefas
      case 'add-tarefa': {
        const pz = $('#nova-prazo').value;
        if (adicionarTarefa($('#nova-tarefa').value, $('#nova-cliente').value, pz ? deInputData(pz) : null)) {
          const cli = $('#nova-cliente').value;
          mudou();
          $('#nova-cliente').value = cli;
          $('#nova-tarefa').focus();
        }
        break;
      }
      case 'toggle-tarefa': {
        const x = achar(dados.tarefas, id);
        if (x) { x.feita = !x.feita; if (x.feita) x.feitaEm = agoraISO(); else delete x.feitaEm; x.editado = agoraISO(); mudou(); }
        break;
      }
      case 'apagar-tarefa': apagarItem('tarefas', id); mudou(); break;
      case 'ver-feitas': ui.verFeitas = !ui.verFeitas; render(true); break;
      case 'limpar-feitas': dados.tarefas.filter((x) => x.feita).forEach((x) => apagarItem('tarefas', x.id)); mudou(); break;
      case 'sugestao': adicionarTarefa(el.dataset.texto, el.dataset.cliente); mudou(); avisar('Virou tarefa'); break;
      case 'outras': ui.semente++; render(true); break;
      // notas
      case 'nova-nota': {
        const agora = agoraISO();
        const n = { id: novoId(), texto: '', criada: agora, editada: agora, editado: agora };
        dados.notas.push(n);
        ui.notaSel = n.id; ui.editandoNota = true;
        mudou();
        const ta = document.querySelector('.nota-editor textarea');
        if (ta) ta.focus();
        break;
      }
      case 'abrir-nota': ui.notaSel = id; ui.editandoNota = true; render(true); window.scrollTo(0, 0); break;
      case 'voltar-notas': ui.editandoNota = false; render(true); break;
      case 'apagar-nota':
        if (confirm('Apagar esta nota?')) { apagarItem('notas', id); ui.notaSel = null; ui.editandoNota = false; mudou(); }
        break;
      // ajustes
      case 'nicho': p.nicho = v; tocarPerfil(); mudou(); avisar(`Sugestões de ${NICHOS[v].nome}`); break;
      case 'tipos-do-nicho':
        if (confirm(`Trocar seus tipos de trabalho pelos de ${NICHOS[p.nicho].nome}? Os tempos já salvos não mudam.`)) {
          p.tipos = [...NICHOS[p.nicho].tipos]; tocarPerfil(); mudou();
        }
        break;
      case 'tirar-tipo':
        if (tipos().length <= 1) { avisar('Deixe pelo menos um tipo'); break; }
        p.tipos = tipos().filter((x) => x !== v); tocarPerfil();
        if (dados.timer.tipo === v) { dados.timer.tipo = p.tipos[0]; tocarTimer(); }
        mudou();
        break;
      case 'add-tipo': {
        const novo = ($('#novo-tipo').value || '').trim();
        if (!novo) break;
        if (!tipos().some((x) => x.toLowerCase() === novo.toLowerCase())) { p.tipos = [...tipos(), novo]; tocarPerfil(); mudou(); }
        $('#novo-tipo') && $('#novo-tipo').focus();
        break;
      }
      case 'tirar-sugestao': p.sugestoes = p.sugestoes.filter((_, i) => String(i) !== v); tocarPerfil(); mudou(); break;
      case 'add-sugestao': {
        const nova = ($('#nova-sugestao').value || '').trim();
        if (!nova) break;
        if (!p.sugestoes.includes(nova)) { p.sugestoes = [...p.sugestoes, nova]; tocarPerfil(); mudou(); }
        $('#nova-sugestao') && $('#nova-sugestao').focus();
        break;
      }
      case 'baixar-backup': baixarArquivo(`orbita-${inputData(agoraISO())}.json`, JSON.stringify(dados, null, 1), 'application/json'); break;
      case 'sair':
        if (confirm(MODO_TESTE ? 'Sair? Seus dados continuam guardados neste aparelho.' : 'Sair da sua conta neste aparelho?')) {
          ui.entrada = { nome: p.nome, email: p.email, nicho: p.nicho, novidades: p.novidades, erro: '' };
          p.email = ''; tocarPerfil(); mudou();
        }
        break;
      default: break;
    }
  });

  document.addEventListener('input', (e) => {
    const el = e.target, c = el.dataset.campo;
    if (c === 'timer-cliente' || c === 'timer-projeto') {
      dados.timer[c === 'timer-cliente' ? 'cliente' : 'projeto'] = el.value;
      tocarTimer(); salvarLocal();
      if (c === 'timer-cliente') renderCanto();
    } else if (c === 'nota-texto') {
      const n = achar(dados.notas, el.dataset.id);
      if (!n) return;
      n.texto = el.value; n.editada = n.editado = agoraISO();
      salvarLocal();
      const tt = document.querySelector(`.nota-item[data-id="${CSS.escape(n.id)}"] .t`);
      if (tt) tt.textContent = titulo(n);
    } else if (c === 'perfil-nome') {
      dados.perfil.nome = el.value; tocarPerfil(); salvarLocal();
    }
  });

  document.addEventListener('change', (e) => {
    const el = e.target, c = el.dataset.campo;
    if (c === 'timer-data' && el.value) { dados.timer.data = deInputData(el.value); tocarTimer(); salvarLocal(); }
    else if (c === 'tarefa-texto') {
      const x = achar(dados.tarefas, el.dataset.id);
      if (x && el.value.trim() && el.value.trim() !== x.texto) { x.texto = el.value.trim(); x.editado = agoraISO(); salvarLocal(); }
    } else if (c === 'filtro-cliente') { ui.filtroCliente = el.value; el.blur(); render(true); }
    else if (c === 'perfil-novidades') { dados.perfil.novidades = el.checked; tocarPerfil(); salvarLocal(); }
    else if (c === 'perfil-gerais') { dados.perfil.semGerais = !el.checked; tocarPerfil(); salvarLocal(); }
  });

  document.addEventListener('keydown', (e) => {
    const el = e.target;
    const enter = el.dataset && el.dataset.enter;
    if (e.key === 'Enter' && enter) {
      e.preventDefault();
      const b = document.querySelector(`[data-acao="${enter}"]`);
      if (b) b.click();
    } else if (e.key === 'Enter' && (el.id === 'e-nome' || el.id === 'e-email')) {
      e.preventDefault(); entrar();
    } else if (e.key === 'Enter' && el.dataset && el.dataset.campo === 'tarefa-texto') {
      el.blur();
    } else if (e.key === 'Escape' && ui.modal) {
      fecharModal();
    }
  });

  document.addEventListener('focusout', () => setTimeout(() => { if (renderPendente && !focoEmCampo()) render(); }, 0));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  setInterval(atualizarRelogios, 1000);

  // ---------- início ----------
  async function iniciar() {
    // Só para testar no computador: dados de exemplo (#demo, #demo-tarefas, #entrada...).
    const demo = location.hostname === 'localhost' && location.hash.match(/^#demo(?:-(\w+))?/);
    if (demo) {
      try { dados = normalizarDados(await (await fetch('demo.json')).json()); } catch { /* sem demo */ }
      if (demo[1]) ui.aba = demo[1];
      if (demo[1] === 'notas') ui.editandoNota = true;
    }
    render(true);
    if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  iniciar();
})();
