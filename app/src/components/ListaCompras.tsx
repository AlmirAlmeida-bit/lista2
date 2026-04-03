import { useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { supabase } from '../supabaseClient'
import { img } from '../img'

interface Item {
  item: string
  quantidade: number
  unidade: string
}

interface ListaSalva {
  id: string
  nome: string
  itens: Item[]
  created_at: string
}

interface Props {
  usuario: User
}

// ─── Ícones inline ────────────────────────────────────────
const IconeCarrinho = () => (
  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-10H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const IconeSair = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
  </svg>
)

const IconeSpinner = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
)

// ─── Toast ────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState<{ msg: string; tipo: 'ok' | 'erro' | 'info' } | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function mostrar(msg: string, tipo: 'ok' | 'erro' | 'info' = 'info') {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ msg, tipo })
    timerRef.current = setTimeout(() => setToast(null), 3500)
  }

  return { toast, mostrar }
}

// ─── Componente principal ─────────────────────────────────
export default function ListaCompras({ usuario }: Props) {
  const [itens, setItens] = useState<Item[]>([])
  const [nomeLista, setNomeLista] = useState('')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [novoItem, setNovoItem] = useState('')
  const [novaQtd, setNovaQtd] = useState('')
  const [novaUnidade, setNovaUnidade] = useState('Unid')
  const [salvando, setSalvando] = useState(false)
  const [carregandoListas, setCarregandoListas] = useState(true)
  const [listasSalvas, setListasSalvas] = useState<ListaSalva[]>([])
  const [abaAtiva, setAbaAtiva] = useState<'nova' | 'salvas'>('nova')

  const { toast, mostrar } = useToast()

  const primeiroNome = usuario.email?.split('@')[0] ?? 'usuário'

  // ── Carregar listas salvas ──────────────────────────────
  async function carregarListas() {
    setCarregandoListas(true)
    const { data, error } = await supabase
      .from('listas_compras')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Supabase] Erro ao carregar listas:', error)
      mostrar(`Erro ao carregar: ${error.message}`, 'erro')
    } else {
      console.log('[Supabase] Listas carregadas:', data)
      setListasSalvas(data as ListaSalva[])
    }
    setCarregandoListas(false)
  }

  useEffect(() => {
    carregarListas()
  }, [])

  // ── Adicionar item à lista atual ────────────────────────
  function adicionarItem() {
    if (!novoItem.trim()) { mostrar('Informe o nome do item.', 'erro'); return }
    const qtd = parseInt(novaQtd)
    if (!novaQtd || isNaN(qtd) || qtd <= 0) { mostrar('Informe uma quantidade válida.', 'erro'); return }

    setItens(prev => [...prev, { item: novoItem.trim(), quantidade: qtd, unidade: novaUnidade }])
    setNovoItem('')
    setNovaQtd('')
    mostrar(`"${novoItem.trim()}" adicionado!`, 'ok')
  }

  function removerItem(index: number) {
    setItens(prev => prev.filter((_, i) => i !== index))
  }

  function editarUltimo() {
    if (itens.length === 0) { mostrar('Nenhum item para editar.', 'erro'); return }
    const ultimo = itens[itens.length - 1]
    setNovoItem(ultimo.item)
    setNovaQtd(String(ultimo.quantidade))
    setNovaUnidade(ultimo.unidade)
    setItens(prev => prev.slice(0, -1))
    mostrar('Último item carregado para edição.', 'info')
  }

  // ── Salvar ou atualizar lista no banco ─────────────────
  async function salvarLista() {
    if (itens.length === 0) { mostrar('Adicione pelo menos um item antes de salvar.', 'erro'); return }
    const nome = nomeLista.trim() || `Lista de ${primeiroNome}`

    setSalvando(true)

    let error

    if (editandoId) {
      // Atualiza a lista existente
      const res = await supabase
        .from('listas_compras')
        .update({ nome, itens })
        .eq('id', editandoId)
        .eq('user_id', usuario.id)
      error = res.error
    } else {
      // Cria uma nova lista
      const res = await supabase.from('listas_compras').insert({
        user_id: usuario.id,
        nome,
        itens,
      })
      error = res.error
    }

    setSalvando(false)

    if (error) {
      console.error('[Supabase] Erro ao salvar lista:', error)
      mostrar(`Erro: ${error.message}`, 'erro')
    } else {
      mostrar(`Lista "${nome}" ${editandoId ? 'atualizada' : 'salva'} com sucesso!`, 'ok')
      setItens([])
      setNomeLista('')
      setEditandoId(null)
      await carregarListas()
      setAbaAtiva('salvas')
    }
  }

  // ── Carregar lista salva para edição ────────────────────
  function carregarListaSalva(lista: ListaSalva) {
    setItens(lista.itens)
    setNomeLista(lista.nome)
    setEditandoId(lista.id)
    setAbaAtiva('nova')
    mostrar(`Lista "${lista.nome}" carregada para edição.`, 'info')
  }

  function cancelarEdicao() {
    setItens([])
    setNomeLista('')
    setEditandoId(null)
  }

  // ── Exportar lista atual para PDF ───────────────────────
  function exportarPdf(itensPdf: Item[], nomePdf: string) {
    if (itensPdf.length === 0) {
      mostrar('Nenhum item para exportar.', 'erro')
      return
    }
    const doc = new jsPDF()
    const titulo = nomePdf || 'Lista de Compras'

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(titulo.toUpperCase(), 105, 15, { align: 'center' })
    doc.setLineWidth(0.5)
    doc.line(10, 20, 200, 20)

    autoTable(doc, {
      head: [['Nº', 'Item', 'Quantidade']],
      body: itensPdf.map((el, i) => [i + 1, el.item, `${el.quantidade} ${el.unidade}`]),
      startY: 25,
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], textColor: 255 },
      styles: { fontSize: 12 },
    })

    doc.save(`${titulo.replace(/\s+/g, '_').toLowerCase()}.pdf`)
    mostrar('PDF gerado com sucesso!', 'ok')
  }

  // ── Excluir lista salva ─────────────────────────────────
  async function excluirLista(id: string, nome: string) {
    const { error } = await supabase.from('listas_compras').delete().eq('id', id)
    if (error) {
      mostrar('Erro ao excluir lista.', 'erro')
    } else {
      mostrar(`Lista "${nome}" excluída.`, 'info')
      setListasSalvas(prev => prev.filter(l => l.id !== id))
    }
  }

  function formatarData(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const toastCores = {
    ok: 'bg-green-800',
    erro: 'bg-red-800',
    info: 'bg-gray-800',
  }

  return (
    <div className="min-h-screen bg-fundo flex flex-col">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 ${toastCores[toast.tipo]} text-white text-sm font-bold px-6 py-3 rounded-full shadow-2xl anim-scaleIn`}>
          {toast.msg}
        </div>
      )}

      {/* Header com gradiente animado */}
      <header className="header-gradient px-5 py-3 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <img src={img('carrinho.png')} alt="Carrinho"
            className="w-9 h-9 object-contain anim-bounce-cart" />
          <div>
            <span className="text-white font-black text-base block leading-tight drop-shadow-sm">Lista da Eliane</span>
            <span className="text-white/70 text-xs">{usuario.email}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-all backdrop-blur-sm"
          >
            <IconeSair /> Sair
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-xl mx-auto w-full">

        {/* Abas */}
        <div className="flex bg-white/90 backdrop-blur-sm rounded-2xl border border-white/60 p-1.5 mb-5 shadow-lg anim-fadeInUp">
          <button
            onClick={() => setAbaAtiva('nova')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              abaAtiva === 'nova'
                ? 'header-gradient text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            ✏️ Nova Lista
          </button>
          <button
            onClick={() => { setAbaAtiva('salvas'); carregarListas() }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              abaAtiva === 'salvas'
                ? 'header-gradient text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            📋 Minhas Listas
            {listasSalvas.length > 0 && (
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                abaAtiva === 'salvas' ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-700'
              }`}>
                {listasSalvas.length}
              </span>
            )}
          </button>
        </div>

        {/* ── ABA: Nova Lista ── */}
        {abaAtiva === 'nova' && (
          <div className="flex flex-col gap-4 anim-fadeInUp">

            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 overflow-hidden">
              {/* Cabeçalho do card */}
              <div className="header-gradient px-5 py-5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <img src={img('carrinho1.png')} alt="" className="w-10 h-10 object-contain anim-float" />
                  <div>
                    <h2 className="text-white font-black text-lg drop-shadow-sm">
                      {nomeLista || (editandoId ? 'Editando Lista' : 'Nova Lista de Compras')}
                    </h2>
                    <p className="text-white/75 text-xs mt-0.5">
                      {editandoId ? '✏️ Modo edição — ' : ''}{itens.length} {itens.length === 1 ? 'item' : 'itens'} adicionados
                    </p>
                  </div>
                </div>
                {editandoId && (
                  <span className="bg-white/25 text-white text-xs font-bold px-3 py-1 rounded-full shrink-0 backdrop-blur-sm">
                    Editando
                  </span>
                )}
              </div>

              <div className="px-5 py-5 flex flex-col gap-4">
                {/* Nome da lista */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nome da Lista</label>
                  <input
                    type="text"
                    value={nomeLista}
                    onChange={e => setNomeLista(e.target.value)}
                    placeholder="Ex: Mercado da semana"
                    maxLength={50}
                    className="border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-3 focus:ring-amber-100 transition-all bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* Item + Quantidade */}
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Item</label>
                    <input
                      type="text"
                      value={novoItem}
                      onChange={e => setNovoItem(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && adicionarItem()}
                      placeholder="Ex: Arroz"
                      className="border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-3 focus:ring-amber-100 transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 w-24">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Qtd.</label>
                    <input
                      type="number"
                      value={novaQtd}
                      onChange={e => setNovaQtd(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && adicionarItem()}
                      placeholder="0"
                      min="1"
                      className="border-2 border-gray-100 rounded-xl px-3 py-3 text-sm outline-none focus:border-amber-400 focus:ring-3 focus:ring-amber-100 transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Unidade */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Medida</label>
                  <div className="flex flex-wrap gap-2">
                    {['Unid', 'kg', 'lt', 'g', 'cx', 'pct'].map(u => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setNovaUnidade(u)}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${
                          novaUnidade === u
                            ? 'bg-amber-400 border-amber-400 text-white shadow-md scale-105'
                            : 'border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600 bg-white'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-2">
                  <button
                    onClick={adicionarItem}
                    className="flex-1 header-gradient text-white font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Adicionar
                  </button>
                  <button
                    onClick={editarUltimo}
                    className="px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 text-sm font-bold transition-all"
                  >
                    Editar Último
                  </button>
                </div>
              </div>
            </div>

            {/* Tabela de itens */}
            {itens.length > 0 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 overflow-hidden anim-fadeInUp">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
                  <span className="text-xs font-black text-amber-700 uppercase tracking-wide">🛒 Itens da Lista</span>
                  <span className="text-xs text-amber-700 font-black bg-amber-100 px-3 py-1 rounded-full">
                    {itens.length} {itens.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-5 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wide w-8">#</th>
                      <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wide">Item</th>
                      <th className="text-left px-3 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wide">Qtd.</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map((el, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-amber-50/60 transition-colors row-anim"
                        style={{ animationDelay: `${i * 40}ms` }}>
                        <td className="px-5 py-3 text-gray-300 text-xs font-bold">{i + 1}</td>
                        <td className="px-3 py-3 font-semibold text-gray-800">{el.item}</td>
                        <td className="px-3 py-3">
                          <span className="text-amber-700 font-black text-xs bg-amber-50 px-2 py-0.5 rounded-full">
                            {el.quantidade} {el.unidade}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => removerItem(i)}
                            className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all hover:scale-110"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Botões Salvar / Exportar */}
                <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-amber-50/30 border-t border-gray-100 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={salvarLista}
                      disabled={salvando}
                      className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {salvando ? (
                        <><IconeSpinner /> Salvando...</>
                      ) : editandoId ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Atualizar Lista
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          Salvar no Banco
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => exportarPdf(itens, nomeLista.trim() || `Lista de ${primeiroNome}`)}
                      className="px-4 py-3 rounded-xl border-2 border-amber-300 text-amber-700 hover:bg-amber-400 hover:text-white hover:border-amber-400 font-bold transition-all flex items-center gap-2 text-sm shadow hover:shadow-md hover:-translate-y-0.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PDF
                    </button>
                  </div>
                  {editandoId && (
                    <button
                      onClick={cancelarEdicao}
                      className="w-full text-gray-400 hover:text-red-500 text-sm font-semibold py-1.5 transition-colors"
                    >
                      Cancelar edição
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ABA: Minhas Listas ── */}
        {abaAtiva === 'salvas' && (
          <div className="flex flex-col gap-3">
            {carregandoListas ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <img src={img('carrinho2.png')} alt="" className="w-16 opacity-30 anim-bounce-cart" />
                <IconeSpinner className="w-6 h-6 text-amber-400" />
              </div>
            ) : listasSalvas.length === 0 ? (
              <div className="bg-white/95 rounded-3xl border border-white/60 shadow-xl flex flex-col items-center justify-center py-14 gap-4 anim-fadeInUp">
                <img src={img('carrinho2.png')} alt="" className="w-20 opacity-20 anim-float" />
                <p className="text-gray-400 text-sm font-semibold">Nenhuma lista salva ainda.</p>
                <button onClick={() => setAbaAtiva('nova')}
                  className="header-gradient text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  Criar nova lista
                </button>
              </div>
            ) : (
              listasSalvas.map((lista, idx) => (
                <div key={lista.id}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg overflow-hidden card-hover anim-fadeInUp"
                  style={{ animationDelay: `${idx * 60}ms` }}>
                  {/* Barra colorida lateral */}
                  <div className="flex">
                    <div className="w-1.5 header-gradient shrink-0" />
                    <div className="flex-1">
                      <div className="px-4 py-4 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img src={img('carrinho.png')} alt="" className="w-8 h-8 object-contain opacity-60" />
                          <div>
                            <h3 className="font-black text-gray-900 text-base">{lista.nome}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                              <span className="text-amber-600 font-bold">{lista.itens.length} {lista.itens.length === 1 ? 'item' : 'itens'}</span>
                              {' · '}{formatarData(lista.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                          <button
                            onClick={() => exportarPdf(lista.itens, lista.nome)}
                            className="text-xs font-bold text-amber-600 hover:text-white bg-amber-50 hover:bg-amber-400 border border-amber-200 hover:border-amber-400 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            PDF
                          </button>
                          <button
                            onClick={() => carregarListaSalva(lista)}
                            className="text-xs font-bold text-gray-600 hover:text-white bg-gray-50 hover:bg-gray-700 border border-gray-200 hover:border-gray-700 px-2.5 py-1.5 rounded-lg transition-all"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => excluirLista(lista.id, lista.nome)}
                            className="text-xs font-bold text-gray-400 hover:text-white hover:bg-red-500 hover:border-red-500 border border-gray-200 px-2.5 py-1.5 rounded-lg transition-all"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>

                      {/* Preview dos itens */}
                      <div className="px-4 pb-4">
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl px-4 py-3 flex flex-wrap gap-x-3 gap-y-1.5">
                          {lista.itens.slice(0, 6).map((el, i) => (
                            <span key={i} className="text-xs text-gray-700">
                              <span className="font-bold text-amber-700">{el.item}</span>
                              <span className="text-gray-400"> {el.quantidade} {el.unidade}</span>
                            </span>
                          ))}
                          {lista.itens.length > 6 && (
                            <span className="text-xs text-amber-500 font-bold">+{lista.itens.length - 6} mais...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-gray-500 py-5 border-t border-white/40 bg-white/30 backdrop-blur-sm">
        &copy; 2026 <a href="#" className="text-amber-600 font-bold hover:underline">trestech.com.br</a> — Almir Almeida
      </footer>
    </div>
  )
}
