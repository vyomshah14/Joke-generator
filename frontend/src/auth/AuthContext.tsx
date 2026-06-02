/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react'
import { api, type LoginRequest, type MeResponse } from '../api'

type AuthContextValue = {
  token: string | null
  username: string | null
  loading: boolean
  login: (req: LoginRequest) => Promise<void>
  register: (req: LoginRequest) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'joke_ui_token'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
  const [token, setToken] = useState<string | null>(initialToken)
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(!!initialToken)

  const logout = () => {
    setToken(null)
    setUsername(null)
    localStorage.removeItem(TOKEN_KEY)
  }

  const refreshMe = async () => {
    if (!token) return
    setLoading(true)
    try {
      const me = await api.me(token)
      setUsername((me as MeResponse).username)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const login = async (req: LoginRequest) => {
    setLoading(true)
    try {
      const res = await api.login(req)
      localStorage.setItem(TOKEN_KEY, res.access_token)
      setToken(res.access_token)
      await refreshMe()
    } finally {
      setLoading(false)
    }
  }

  const register = async (req: LoginRequest) => {
    setLoading(true)
    try {
      await api.register({ username: req.username, password: req.password })
      // After register, user can login normally from the UI.
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextValue = {
    token,
    username,
    loading,
    login,
    register,
    logout,
    refreshMe,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

