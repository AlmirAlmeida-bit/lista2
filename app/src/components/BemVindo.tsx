import { supabase } from '../supabaseClient'
import type { User } from '@supabase/supabase-js'

interface BemVindoProps {
  usuario: User
}

export default function BemVindo({ usuario }: BemVindoProps) {
  async function handleSair() {
    await supabase.auth.signOut()
  }

  const primeiroNome = usuario.email?.split('@')[0] ?? 'usuário'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Top bar */}
      <header className="bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-10H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-white font-semibold text-base">Lista da Eliane</span>
        </div>
        <button
          onClick={handleSair}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
          Sair
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm overflow-hidden text-center">
          <div className="bg-amber-400 px-8 py-8">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-white font-bold text-2xl">Olá, {primeiroNome}!</h1>
            <p className="text-amber-100 text-sm mt-1">Você está conectado</p>
          </div>

          <div className="px-8 py-7 flex flex-col gap-4">
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-left">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Conta</p>
              <p className="text-sm text-gray-700 font-medium break-all">{usuario.email}</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-left">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Status</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm text-gray-700 font-medium">Autenticado com sucesso</span>
              </div>
            </div>

            <p className="text-gray-400 text-sm">
              Em breve suas listas de compras aparecerão aqui.
            </p>

            <button
              onClick={handleSair}
              className="w-full border border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 text-gray-600 font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
              </svg>
              Sair da conta
            </button>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-4">
        &copy; 2025 <a href="#" className="text-amber-500 hover:underline">trestech.com.br</a> — Almir Almeida
      </footer>
    </div>
  )
}
