import AuthModal from '../components/AuthModal'

// Página de inicio de sesión
export default function Login() {
  return (
    <div className="p-4 max-w-sm mx-auto">
      <h2 className="text-xl mb-2">Iniciar Sesión</h2>
      <AuthModal />
    </div>
  )
}
