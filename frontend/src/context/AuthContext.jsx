import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

/* Helpers */
const safeJSON = (str) => {
  if (!str || str === 'undefined' || str === 'null') return null
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

const normalizeUser = (raw) => {
  if (!raw || typeof raw !== 'object') return null

  return (
    raw.user ||
    raw.teacher ||
    raw.data?.user ||
    raw.data?.teacher ||
    raw.data ||
    raw
  )
}

export const extractUserId = (obj) =>
  obj?._id || obj?.id || obj?.userId || null

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUserRaw = safeJSON(localStorage.getItem('ek_user'))
    const storedRole = localStorage.getItem('ek_role') || null

    const normalizedUser = normalizeUser(storedUserRaw)

    if (normalizedUser && extractUserId(normalizedUser) && storedRole) {
      setUser(normalizedUser)
      setRole(storedRole)

      // Réécrit une version propre en localStorage
      localStorage.setItem('ek_user', JSON.stringify(normalizedUser))
      localStorage.setItem('ek_role', storedRole)
    } else {
      localStorage.removeItem('ek_user')
      localStorage.removeItem('ek_role')
      localStorage.removeItem('ek_token')
    }

    setLoading(false)
  }, [])

  const login = (userData, userRole, token = null) => {
    if (!userData || !userRole) {
      console.error('AuthContext.login() — missing userData or userRole', {
        userData,
        userRole,
      })
      return false
    }

    const normalized = normalizeUser(userData)

    console.log('LOGIN raw =', userData)
    console.log('LOGIN normalized =', normalized)

    if (!extractUserId(normalized)) {
      console.error('AuthContext.login() — cannot find _id/id in userData.', {
        raw: userData,
        normalized,
      })
      return false
    }

    setUser(normalized)
    setRole(userRole)

    localStorage.setItem('ek_user', JSON.stringify(normalized))
    localStorage.setItem('ek_role', userRole)

    if (token) {
      localStorage.setItem('ek_token', token)
    }

    return true
  }

  const logout = () => {
    setUser(null)
    setRole(null)

    localStorage.removeItem('ek_user')
    localStorage.removeItem('ek_role')
    localStorage.removeItem('ek_token')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
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