import { useAuth } from '../hooks/useAuth'

// Página de perfil de usuario
export default function Perfil() {
  const { usuario, logout } = useAuth()

  if (!usuario) return <p className="p-4">No autenticado</p>

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Perfil</h2>
      <p>{usuario.email}</p>
      <button onClick={logout} className="mt-2 bg-red-500 text-white px-2 py-1">
        Cerrar sesión
      </button>
    </div>
  )
}
