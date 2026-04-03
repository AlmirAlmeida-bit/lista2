import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { img } from '../img'

interface LoginProps {
  onIrParaCadastro: () => void
}

export default function Login({ onIrParaCadastro }: LoginProps) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setCarregando(false)
    if (error) setErro('E-mail ou senha incorretos. Verifique e tente novamente.')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-fundo"
    >
      {/* Carrinhos decorativos flutuando ao fundo */}
      <img src={img('carrinho2.png')} alt=""
        className="absolute top-8 left-6 w-16 opacity-20 anim-float delay-100 pointer-events-none select-none" />
      <img src={img('carrinho1.png')} alt=""
        className="absolute bottom-16 right-8 w-20 opacity-15 anim-float delay-300 pointer-events-none select-none" />
      <img src={img('carrinho.png')} alt=""
        className="absolute top-1/2 left-4 w-10 opacity-10 anim-float delay-500 pointer-events-none select-none" />

      {/* Card principal */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden anim-scaleIn relative z-10">

        {/* Header colorido com gradiente */}
        <div className="header-gradient px-8 py-8 flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
              <img
                src={img('carrinho.png')}
                alt="Carrinho"
                className="w-12 h-12 object-contain anim-bounce-cart"
              />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-white font-black text-2xl drop-shadow-sm">Lista da Eliane</h1>
            <p className="text-white/80 text-sm mt-1">Entre na sua conta para continuar</p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="px-8 py-7 flex flex-col gap-5">

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 anim-slideLeft">
              {erro}
            </div>
          )}

          <div className="flex flex-col gap-1.5 anim-fadeInUp delay-100">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-amber-400 focus:ring-3 focus:ring-amber-100 transition-all bg-gray-50 focus:bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5 anim-fadeInUp delay-200">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              className="border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-amber-400 focus:ring-3 focus:ring-amber-100 transition-all bg-gray-50 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="header-gradient disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 anim-fadeInUp delay-300"
          >
            {carregando ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Entrando...
              </>
            ) : 'Entrar'}
          </button>

          <p className="text-center text-sm text-gray-500 anim-fadeInUp delay-400">
            Não tem conta?{' '}
            <button type="button" onClick={onIrParaCadastro}
              className="text-amber-500 font-bold hover:text-amber-600 hover:underline transition-colors">
              Cadastrar agora
            </button>
          </p>
        </form>

      </div>
    </div>
  )
}
