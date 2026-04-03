import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { img } from '../img'

interface CadastroProps {
  onIrParaLogin: () => void
}

export default function Cadastro({ onIrParaLogin }: CadastroProps) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSucesso('')
    if (senha !== confirmarSenha) { setErro('As senhas não coincidem.'); return }
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    setCarregando(true)
    const { error } = await supabase.auth.signUp({ email, password: senha })
    setCarregando(false)
    if (error) setErro('Não foi possível criar a conta. Tente novamente.')
    else setSucesso('Conta criada! Verifique seu e-mail para confirmar o cadastro.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-fundo">

      {/* Decoração flutuante */}
      <img src={img('carrinho1.png')} alt=""
        className="absolute top-10 right-8 w-16 opacity-20 anim-float delay-200 pointer-events-none select-none" />
      <img src={img('carrinho2.png')} alt=""
        className="absolute bottom-12 left-6 w-14 opacity-15 anim-float delay-400 pointer-events-none select-none" />

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden anim-scaleIn relative z-10">

        {/* Header */}
        <div className="header-gradient px-8 py-8 flex flex-col items-center gap-3">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
            <img src={img('carrinho.png')} alt="Carrinho"
              className="w-12 h-12 object-contain anim-bounce-cart" />
          </div>
          <div className="text-center">
            <h1 className="text-white font-black text-2xl drop-shadow-sm">Criar Conta</h1>
            <p className="text-white/80 text-sm mt-1">Cadastre-se para salvar suas listas</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleCadastro} className="px-8 py-7 flex flex-col gap-4">

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 anim-slideLeft">
              {erro}
            </div>
          )}
          {sucesso && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 anim-slideLeft">
              {sucesso}
            </div>
          )}

          <div className="flex flex-col gap-1.5 anim-fadeInUp delay-100">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" required
              className="border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-3 focus:ring-amber-100 transition-all bg-gray-50 focus:bg-white" />
          </div>

          <div className="flex flex-col gap-1.5 anim-fadeInUp delay-200">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres" required
              className="border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-3 focus:ring-amber-100 transition-all bg-gray-50 focus:bg-white" />
          </div>

          <div className="flex flex-col gap-1.5 anim-fadeInUp delay-300">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Confirmar Senha</label>
            <input type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)}
              placeholder="Repita a senha" required
              className={`border-2 rounded-xl px-4 py-3 text-sm outline-none transition-all bg-gray-50 focus:bg-white ${
                confirmarSenha && senha !== confirmarSenha
                  ? 'border-red-300 focus:border-red-400 focus:ring-3 focus:ring-red-100'
                  : 'border-gray-100 focus:border-amber-400 focus:ring-3 focus:ring-amber-100'
              }`} />
            {confirmarSenha && senha !== confirmarSenha && (
              <span className="text-red-500 text-xs font-medium">As senhas não coincidem</span>
            )}
          </div>

          <button type="submit" disabled={carregando || !!sucesso}
            className="header-gradient disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 anim-fadeInUp delay-400 mt-1">
            {carregando ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Cadastrando...
              </>
            ) : 'Criar conta'}
          </button>

          <p className="text-center text-sm text-gray-500 anim-fadeInUp delay-500">
            Já tem conta?{' '}
            <button type="button" onClick={onIrParaLogin}
              className="text-amber-500 font-bold hover:text-amber-600 hover:underline transition-colors">
              Entrar
            </button>
          </p>
        </form>

        <div className="px-8 pb-6 flex justify-center">
          <img src={img('logoguanabara.jpg')} alt="Logo"
            className="h-8 object-contain opacity-40 grayscale hover:opacity-70 hover:grayscale-0 transition-all rounded" />
        </div>
      </div>
    </div>
  )
}
