// src/context/AuthContext.jsx
// Contexte global d'authentification — géré pour les 3 rôles

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null)
  const [token, setToken]   = useState(null)
  const [role, setRole]     = useState(null)  // 'teacher' | 'parent' | 'student'
  const [loading, setLoading] = useState(true)

  // Charger depuis localStorage au démarrage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('ek_token')
      const storedUser  = localStorage.getItem('ek_user')
      const storedRole  = localStorage.getItem('ek_role')

      if (storedToken && storedUser && storedRole) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        setRole(storedRole)
      }
    } catch {
      // Token invalide — nettoyer
      localStorage.removeItem('ek_token')
      localStorage.removeItem('ek_user')
      localStorage.removeItem('ek_role')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (userData, userToken, userRole) => {
    setUser(userData)
    setToken(userToken)
    setRole(userRole)

    localStorage.setItem('ek_token', userToken)
    localStorage.setItem('ek_user', JSON.stringify(userData))
    localStorage.setItem('ek_role', userRole)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setRole(null)

    localStorage.removeItem('ek_token')
    localStorage.removeItem('ek_user')
    localStorage.removeItem('ek_role')
  }

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{
      user,
      token,
      role,
      loading,
      login,
      logout,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext