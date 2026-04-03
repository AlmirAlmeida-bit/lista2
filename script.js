let lista = [];

// ─── Toast ────────────────────────────────────────────────
let toastTimer = null;
function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.className = `toast toast--${tipo} toast--show`;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('toast--show');
    }, 3000);
}

// ─── Título da lista ──────────────────────────────────────
function atualizarTituloLista() {
    const nomeLista = document.getElementById('nomeLista').value.trim() || 'Lista de Compras da Eliane';
    document.getElementById('tituloLista').textContent = nomeLista;
}

// ─── Renderizar tabela ────────────────────────────────────
function atualizarLista() {
    atualizarTituloLista();
    const listaDisplay = document.getElementById('listaDisplay');
    const contador = document.getElementById('contadorItens');

    contador.textContent = `${lista.length} ${lista.length === 1 ? 'item' : 'itens'}`;

    if (lista.length === 0) {
        listaDisplay.innerHTML = `
            <div class="lista-vazia">
                <i class="fa-solid fa-basket-shopping"></i>
                <p>Nenhum item adicionado ainda.</p>
            </div>`;
        return;
    }

    const linhas = lista.map((el, i) => `
        <tr>
            <td class="td-numero">${i + 1}</td>
            <td class="td-item">${escaparHTML(el.item)}</td>
            <td class="td-qtd">${el.quantidade} ${el.unidade}</td>
            <td class="td-acao">
                <button class="btn-excluir" title="Remover item" data-index="${i}">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        </tr>`).join('');

    listaDisplay.innerHTML = `
        <table class="lista-tabela">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th>Qtd.</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>${linhas}</tbody>
        </table>`;

    listaDisplay.querySelectorAll('.btn-excluir').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            const nomeItem = lista[idx].item;
            lista.splice(idx, 1);
            atualizarLista();
            mostrarToast(`"${nomeItem}" removido da lista.`, 'info');
        });
    });
}

function escaparHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ─── Adicionar item ───────────────────────────────────────
document.getElementById('adicionar').addEventListener('click', () => {
    const itemInput = document.getElementById('item');
    const quantidadeInput = document.getElementById('quantidade');
    const item = itemInput.value.trim();
    const quantidade = quantidadeInput.value;
    const unidade = document.querySelector('input[name="unidade"]:checked').value;

    if (!item) {
        mostrarToast('Informe o nome do item.', 'error');
        itemInput.focus();
        return;
    }
    if (!quantidade || isNaN(quantidade) || parseInt(quantidade) <= 0) {
        mostrarToast('Informe uma quantidade válida.', 'error');
        quantidadeInput.focus();
        return;
    }

    lista.push({ item, quantidade: parseInt(quantidade), unidade });
    atualizarLista();
    itemInput.value = '';
    quantidadeInput.value = '';
    itemInput.focus();
    mostrarToast(`"${item}" adicionado!`, 'success');
});

// ─── Editar último ────────────────────────────────────────
document.getElementById('editarUltimo').addEventListener('click', () => {
    if (lista.length === 0) {
        mostrarToast('Nenhum item para editar.', 'error');
        return;
    }
    const ultimo = lista[lista.length - 1];
    document.getElementById('item').value = ultimo.item;
    document.getElementById('quantidade').value = ultimo.quantidade;
    document.querySelector(`input[name="unidade"][value="${ultimo.unidade}"]`).checked = true;
    lista.pop();
    atualizarLista();
    document.getElementById('item').focus();
    mostrarToast('Último item carregado para edição.', 'info');
});

// ─── Nome da lista ────────────────────────────────────────
document.getElementById('nomeLista').addEventListener('input', atualizarTituloLista);

// ─── Exportar PDF ─────────────────────────────────────────
document.getElementById('exportarPdf').addEventListener('click', () => {
    if (lista.length === 0) {
        mostrarToast('Nenhum item na lista para exportar.', 'error');
        return;
    }
    const nomeLista = document.getElementById('nomeLista').value.trim() || 'Lista de Compras';
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(nomeLista.toUpperCase(), 105, 15, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(10, 20, 200, 20);
    const bodyData = lista.map((el, i) => [i + 1, el.item, `${el.quantidade} ${el.unidade}`]);
    doc.autoTable({
        head: [['Nº', 'Item', 'Quantidade']],
        body: bodyData,
        startY: 25,
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11], textColor: 255 },
        styles: { fontSize: 12 }
    });
    doc.save(`${nomeLista.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    mostrarToast('PDF gerado com sucesso!', 'success');
});

// ─── Init ─────────────────────────────────────────────────
window.addEventListener('load', () => {
    lista = [];
    document.getElementById('nomeLista').value = '';
    document.getElementById('item').value = '';
    document.getElementById('quantidade').value = '';
    document.querySelector('input[name="unidade"][value="lt"]').checked = true;
    atualizarLista();
});
