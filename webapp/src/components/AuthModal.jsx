import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

// Modal de autenticación básico
export default function AuthModal() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input className="border w-full" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input className="border w-full" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" />
      <button className="bg-blue-500 text-white px-2 py-1">Entrar</button>
    </form>
  )
}
