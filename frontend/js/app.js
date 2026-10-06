/**
 * SmartManage — Gerenciamento de Celulares
 * Frontend em JavaScript Puro (Vanilla JS)
 */

// SVG Placeholder para imagens indisponíveis ou quebradas
const PLACEHOLDER_IMG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" fill="%23111827"><rect width="100%" height="100%" fill="%23111827"/><rect x="110" y="30" width="80" height="140" rx="12" fill="none" stroke="%236366f1" stroke-width="3"/><circle cx="150" cy="155" r="4" fill="%236366f1"/><line x1="135" y1="42" x2="165" y2="42" stroke="%236366f1" stroke-width="2" stroke-linecap="round"/><text x="150" y="105" fill="%239ca3af" font-family="sans-serif" font-size="12" text-anchor="middle">Sem Imagem</text></svg>`;

// URL Base da API — utiliza caminho relativo para compatibilidade local e Vercel
const API_URL = '/api/celulares';

// Estado global da aplicação client-side
let listaCelulares = [];
let celularSelecionadoExclusao = null;

// Elementos da Interface (DOM)
const gridCelulares = document.getElementById('celulares-grid');
const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');
const emptyStateDesc = document.getElementById('empty-state-desc');
const errorState = document.getElementById('error-state');
const errorStateMsg = document.getElementById('error-state-message');
const statsBar = document.getElementById('stats-bar');
const statTotal = document.getElementById('stat-total');
const statMedia = document.getElementById('stat-media');
const statTopBrand = document.getElementById('stat-top-brand');
const inputBusca = document.getElementById('input-busca');

// Modal de Formulário
const modalForm = document.getElementById('modal-form');
const modalTitulo = document.getElementById('modal-titulo');
const formCelular = document.getElementById('form-celular');
const campoId = document.getElementById('celular-id');
const campoMarca = document.getElementById('campo-marca');
const campoModelo = document.getElementById('campo-modelo');
const campoPreco = document.getElementById('campo-preco');
const campoFoto = document.getElementById('campo-foto');
const imgPreview = document.getElementById('img-preview');
const previewPlaceholder = document.getElementById('preview-placeholder');
const formAlertaErro = document.getElementById('form-alerta-erro');
const btnSalvarTexto = document.getElementById('btn-salvar-texto');
const btnSalvarSpinner = document.getElementById('btn-salvar-spinner');
const btnSalvarCelular = document.getElementById('btn-salvar-celular');

// Modal de Exclusão
const modalDelete = document.getElementById('modal-confirm-delete');
const deleteMessage = document.getElementById('delete-message');
const btnConfirmarDelete = document.getElementById('btn-confirmar-delete');
const btnDeleteTexto = document.getElementById('btn-delete-texto');
const btnDeleteSpinner = document.getElementById('btn-delete-spinner');

// Container de Toasts
const toastContainer = document.getElementById('toast-container');

/**
 * Exibe notificações flutuantes (toasts)
 */
function showToast(message, type = 'info', duration = 3500) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `<span><strong>${icon}</strong></span><span>${message}</span>`;
  
  toastContainer.appendChild(toast);
  
  // Força reflow para animação
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Formata valores para a moeda Real Brasileiro (BRL)
 */
function formatarPreco(valor) {
  const num = Number(valor) || 0;
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Atualiza os cards de métricas no topo da página
 */
function atualizarMetricas(celulares) {
  statTotal.textContent = celulares.length;

  if (celulares.length === 0) {
    statMedia.textContent = 'R$ 0,00';
    statTopBrand.textContent = '—';
    return;
  }

  const soma = celulares.reduce((acc, c) => acc + (Number(c.preco) || 0), 0);
  const media = soma / celulares.length;
  statMedia.textContent = formatarPreco(media);

  // Calcula a marca com mais aparelhos
  const marcasContagem = {};
  celulares.forEach((c) => {
    const m = (c.marca || '').trim();
    if (m) marcasContagem[m] = (marcasContagem[m] || 0) + 1;
  });

  let topMarca = '—';
  let maxCount = 0;
  for (const [marca, count] of Object.entries(marcasContagem)) {
    if (count > maxCount) {
      maxCount = count;
      topMarca = `${marca} (${count})`;
    }
  }
  statTopBrand.textContent = topMarca;
}

/**
 * Busca a lista de celulares na API backend
 */
async function carregarCelulares() {
  // Configura estado de carregamento
  gridCelulares.innerHTML = '';
  loadingState.style.display = 'grid';
  emptyState.style.display = 'none';
  errorState.style.display = 'none';

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      const erroJson = await response.json().catch(() => ({}));
      throw new Error(erroJson.message || `Erro HTTP ${response.status}`);
    }

    const dados = await response.json();
    listaCelulares = Array.isArray(dados) ? dados : [];

    loadingState.style.display = 'none';
    atualizarMetricas(listaCelulares);
    renderizarCards(listaCelulares);
  } catch (err) {
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
    errorStateMsg.textContent = `Falha ao carregar celulares: ${err.message}`;
    showToast(`Erro ao conectar com a API: ${err.message}`, 'error');
  }
}

/**
 * Renderiza os cards na tela conforme a lista fornecida
 */
function renderizarCards(celulares) {
  gridCelulares.innerHTML = '';

  if (celulares.length === 0) {
    emptyState.style.display = 'block';
    const termo = inputBusca.value.trim();
    if (termo) {
      emptyStateDesc.textContent = `Nenhum aparelho encontrado para a busca "${termo}".`;
    } else {
      emptyStateDesc.textContent = 'Cadastre seu primeiro smartphone para começar a gerenciar seu inventário.';
    }
    return;
  }

  emptyState.style.display = 'none';

  celulares.forEach((celular) => {
    const card = document.createElement('article');
    card.className = 'phone-card';
    card.setAttribute('data-id', celular._id);

    const fotoUrl = celular.foto || PLACEHOLDER_IMG;

    card.innerHTML = `
      <div class="phone-img-wrapper">
        <span class="phone-brand-tag">${escaparHTML(celular.marca)}</span>
        <img 
          class="phone-img" 
          src="${escaparHTML(fotoUrl)}" 
          alt="${escaparHTML(celular.marca)} ${escaparHTML(celular.modelo)}" 
          loading="lazy"
        />
      </div>
      <div class="phone-card-body">
        <h3 class="phone-model">${escaparHTML(celular.modelo)}</h3>
        <div class="phone-price-row">
          <span class="price-label">Valor</span>
          <span class="phone-price">${formatarPreco(celular.preco)}</span>
        </div>
        <div class="phone-card-actions">
          <button class="btn btn-edit btn-sm btn-acao-editar" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            Editar
          </button>
          <button class="btn btn-delete btn-sm btn-acao-excluir" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Excluir
          </button>
        </div>
      </div>
    `;

    // Tratamento de imagem quebrada com fallback automático
    const imgEl = card.querySelector('.phone-img');
    imgEl.addEventListener('error', () => {
      imgEl.src = PLACEHOLDER_IMG;
    });

    // Eventos de Ação do Card
    const btnEditar = card.querySelector('.btn-acao-editar');
    btnEditar.addEventListener('click', () => abrirModalEdicao(celular));

    const btnExcluir = card.querySelector('.btn-acao-excluir');
    btnExcluir.addEventListener('click', () => abrirModalExclusao(celular));

    gridCelulares.appendChild(card);
  });
}

/**
 * Escapa strings para evitar injeção de HTML no DOM
 */
function escaparHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Abre o modal no modo de Cadastro
 */
function abrirModalNovo() {
  formCelular.reset();
  campoId.value = '';
  modalTitulo.textContent = 'Novo Celular';
  btnSalvarTexto.textContent = 'Cadastrar Celular';
  esconderErrosFormulario();
  atualizarPreviewImagem('');
  modalForm.classList.add('active');
  modalForm.setAttribute('aria-hidden', 'false');
  campoMarca.focus();
}

/**
 * Abre o modal no modo de Edição preenchendo os campos
 */
function abrirModalEdicao(celular) {
  formCelular.reset();
  campoId.value = celular._id;
  campoMarca.value = celular.marca || '';
  campoModelo.value = celular.modelo || '';
  campoPreco.value = celular.preco !== undefined ? celular.preco : '';
  campoFoto.value = celular.foto || '';

  modalTitulo.textContent = 'Editar Celular';
  btnSalvarTexto.textContent = 'Atualizar Celular';
  esconderErrosFormulario();
  atualizarPreviewImagem(celular.foto || '');
  modalForm.classList.add('active');
  modalForm.setAttribute('aria-hidden', 'false');
  campoMarca.focus();
}

/**
 * Fecha o modal de formulário
 */
function fecharModalForm() {
  modalForm.classList.remove('active');
  modalForm.setAttribute('aria-hidden', 'true');
  formCelular.reset();
  esconderErrosFormulario();
}

/**
 * Atualiza o box de pré-visualização de imagem
 */
function atualizarPreviewImagem(url) {
  const urlLimpa = (url || '').trim();
  if (urlLimpa) {
    imgPreview.src = urlLimpa;
    imgPreview.style.display = 'block';
    previewPlaceholder.style.display = 'none';

    imgPreview.onerror = () => {
      imgPreview.onerror = null;
      imgPreview.src = PLACEHOLDER_IMG;
    };
  } else {
    imgPreview.src = '';
    imgPreview.style.display = 'none';
    previewPlaceholder.style.display = 'block';
  }
}

/**
 * Limpa mensagens de erro de campos
 */
function esconderErrosFormulario() {
  document.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
  formAlertaErro.style.display = 'none';
  formAlertaErro.textContent = '';
}

/**
 * Submissão do formulário de cadastro / edição
 */
async function handleSalvarCelular(e) {
  e.preventDefault();
  esconderErrosFormulario();

  const id = campoId.value.trim();
  const marca = campoMarca.value.trim();
  const modelo = campoModelo.value.trim();
  const precoStr = String(campoPreco.value || '').trim().replace(',', '.');
  const foto = campoFoto.value.trim();

  // Validação rápida no cliente
  let temErro = false;
  if (!marca) {
    document.getElementById('erro-marca').textContent = 'Informe a marca do aparelho.';
    temErro = true;
  }
  if (!modelo) {
    document.getElementById('erro-modelo').textContent = 'Informe o modelo do aparelho.';
    temErro = true;
  }
  if (precoStr === '') {
    document.getElementById('erro-preco').textContent = 'Informe o preço.';
    temErro = true;
  } else {
    const precoNum = Number(precoStr);
    if (Number.isNaN(precoNum) || !Number.isFinite(precoNum)) {
      document.getElementById('erro-preco').textContent = 'Informe um preço válido.';
      temErro = true;
    } else if (precoNum < 0) {
      document.getElementById('erro-preco').textContent = 'O preço não pode ser negativo.';
      temErro = true;
    }
  }
  if (!foto) {
    document.getElementById('erro-foto').textContent = 'Informe a URL da foto.';
    temErro = true;
  }

  if (temErro) return;

  const payload = {
    marca,
    modelo,
    preco: parseFloat(precoStr),
    foto,
  };

  // Feedback de carregamento no botão
  btnSalvarCelular.disabled = true;
  btnSalvarSpinner.style.display = 'inline-block';
  btnSalvarTexto.textContent = id ? 'Atualizando...' : 'Salvando...';

  try {
    const isEdicao = Boolean(id);
    const url = isEdicao ? `${API_URL}/${id}` : API_URL;
    const metodo = isEdicao ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const respostaJson = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(respostaJson.message || 'Erro ao processar requisição.');
    }

    showToast(
      isEdicao ? 'Celular atualizado com sucesso!' : 'Celular cadastrado com sucesso!',
      'success'
    );

    fecharModalForm();
    await carregarCelulares();
  } catch (err) {
    formAlertaErro.textContent = err.message;
    formAlertaErro.style.display = 'block';
    showToast(err.message, 'error');
  } finally {
    btnSalvarCelular.disabled = false;
    btnSalvarSpinner.style.display = 'none';
    btnSalvarTexto.textContent = id ? 'Atualizar Celular' : 'Cadastrar Celular';
  }
}

/**
 * Abre o modal de confirmação de exclusão
 */
function abrirModalExclusao(celular) {
  celularSelecionadoExclusao = celular;
  deleteMessage.textContent = `Tem certeza que deseja excluir o aparelho "${celular.marca} ${celular.modelo}"? Esta ação não pode ser desfeita.`;
  modalDelete.classList.add('active');
  modalDelete.setAttribute('aria-hidden', 'false');
}

/**
 * Fecha o modal de exclusão
 */
function fecharModalExclusao() {
  modalDelete.classList.remove('active');
  modalDelete.setAttribute('aria-hidden', 'true');
  celularSelecionadoExclusao = null;
}

/**
 * Executa a requisição DELETE para remover o celular
 */
async function handleConfirmarExclusao() {
  if (!celularSelecionadoExclusao) return;

  const id = celularSelecionadoExclusao._id;
  btnConfirmarDelete.disabled = true;
  btnDeleteSpinner.style.display = 'inline-block';
  btnDeleteTexto.textContent = 'Excluindo...';

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });

    const respostaJson = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(respostaJson.message || 'Erro ao excluir celular.');
    }

    showToast('Aparelho excluído com sucesso!', 'success');
    fecharModalExclusao();
    await carregarCelulares();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btnConfirmarDelete.disabled = false;
    btnDeleteSpinner.style.display = 'none';
    btnDeleteTexto.textContent = 'Sim, Excluir';
  }
}

/**
 * Filtro em tempo real de celulares por marca ou modelo
 */
function filtrarCelulares() {
  const termo = inputBusca.value.toLowerCase().trim();
  if (!termo) {
    renderizarCards(listaCelulares);
    return;
  }

  const filtrados = listaCelulares.filter((c) => {
    const marca = (c.marca || '').toLowerCase();
    const modelo = (c.modelo || '').toLowerCase();
    return marca.includes(termo) || modelo.includes(termo);
  });

  renderizarCards(filtrados);
}

/**
 * Registro de Ouvintes de Eventos (Event Listeners)
 */
function registrarEventos() {
  // Abertura e fechamento de modais
  document.getElementById('btn-novo-celular').addEventListener('click', abrirModalNovo);
  document.getElementById('btn-cadastrar-primeiro').addEventListener('click', abrirModalNovo);
  document.getElementById('btn-fechar-modal').addEventListener('click', fecharModalForm);
  document.getElementById('btn-cancelar-form').addEventListener('click', fecharModalForm);
  document.getElementById('btn-cancelar-delete').addEventListener('click', fecharModalExclusao);
  document.getElementById('btn-recarregar').addEventListener('click', carregarCelulares);
  document.getElementById('btn-tentar-novamente').addEventListener('click', carregarCelulares);

  // Fechar modal ao clicar fora do card
  modalForm.addEventListener('click', (e) => {
    if (e.target === modalForm) fecharModalForm();
  });
  modalDelete.addEventListener('click', (e) => {
    if (e.target === modalDelete) fecharModalExclusao();
  });

  // Ações de formulário
  formCelular.addEventListener('submit', handleSalvarCelular);
  btnConfirmarDelete.addEventListener('click', handleConfirmarExclusao);

  // Preview de imagem ao digitar URL
  campoFoto.addEventListener('input', (e) => {
    atualizarPreviewImagem(e.target.value);
  });

  // Busca em tempo real com debounce simples
  let debounceTimeout = null;
  inputBusca.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(filtrarCelulares, 150);
  });

  // Tecla ESC fecha modais
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modalForm.classList.contains('active')) fecharModalForm();
      if (modalDelete.classList.contains('active')) fecharModalExclusao();
    }
  });
}

// Inicialização da aplicação ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
  registrarEventos();
  carregarCelulares();
});
