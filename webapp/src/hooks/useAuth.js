import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../firebase'

// Hook personalizado para autenticación
export function useAuth() {
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => setUsuario(user))
    return unsub
  }, [])

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    await signOut(auth)
  }

  return { usuario, login, logout }
}
