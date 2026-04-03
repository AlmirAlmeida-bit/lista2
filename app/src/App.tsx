import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, supabaseConfigurado } from './supabaseClient'
import Login from './components/Login'
import Cadastro from './components/Cadastro'
import ListaCompras from './components/ListaCompras'

type Tela = 'login' | 'cadastro'

function AvisoCredenciais() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="bg-amber-400 px-8 py-6">
          <div className="flex items-center gap-3">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <h1 className="text-white font-bold text-xl">Configuração Necessária</h1>
          </div>
        </div>
        <div className="px-8 py-7 flex flex-col gap-5">
          <p className="text-gray-600 text-sm leading-relaxed">
            As credenciais do Supabase ainda não foram configuradas. Siga os passos abaixo:
          </p>
          <ol className="flex flex-col gap-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="bg-amber-100 text-amber-700 font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs">1</span>
              <span>Acesse <a href="https://supabase.com" target="_blank" className="text-amber-600 font-semibold underline">supabase.com</a> → seu projeto → <strong>Project Settings → API</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="bg-amber-100 text-amber-700 font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs">2</span>
              <span>Crie o arquivo <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">app/.env</code> na pasta do projeto</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-amber-100 text-amber-700 font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs">3</span>
              <span>Cole as variáveis abaixo com seus valores reais:</span>
            </li>
          </ol>
          <div className="bg-gray-900 rounded-xl px-5 py-4 font-mono text-xs text-green-400 leading-relaxed">
            <p>VITE_SUPABASE_URL=https://xxxx.supabase.co</p>
            <p>VITE_SUPABASE_ANON_KEY=eyJhbGciOi...</p>
          </div>
          <p className="text-gray-400 text-xs">
            Após salvar o arquivo <code className="bg-gray-100 px-1 rounded">.env</code>, reinicie o servidor com <code className="bg-gray-100 px-1 rounded">npm run dev</code>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [usuario, setUsuario] = useState<User | null>(null)
  const [telaAtual, setTelaAtual] = useState<Tela>('login')
  const [inicializando, setInicializando] = useState(true)

  useEffect(() => {
    if (!supabaseConfigurado) {
      setInicializando(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setUsuario(data.session?.user ?? null)
      setInicializando(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (inicializando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-gray-400 text-sm font-medium">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!supabaseConfigurado) {
    return <AvisoCredenciais />
  }

  if (usuario) {
    return <ListaCompras usuario={usuario} />
  }

  if (telaAtual === 'cadastro') {
    return <Cadastro onIrParaLogin={() => setTelaAtual('login')} />
  }

  return <Login onIrParaCadastro={() => setTelaAtual('cadastro')} />
}
