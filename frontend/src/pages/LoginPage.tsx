import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const schema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(32),
  password: z.string().min(4, 'Password must be at least 4 characters').max(72),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const nav = useNavigate()
  const { login, register, loading } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      if (mode === 'login') await login(values)
      else await register(values)
      nav('/dashboard', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h1 style={{ margin: '0 0 12px 0' }}>{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
        <p style={{ margin: '0 0 18px 0' }}>
          {mode === 'login'
            ? 'Login to add/delete jokes and generate stats.'
            : 'You can register here, then sign in.'}
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="col"
          style={{ marginTop: 10 }}
          aria-label="login-form"
        >
          <div className="col" style={{ gap: 6 }}>
            <div className="fieldLabel">Username</div>
            <input className="input" {...form.register('username')} placeholder="e.g. vyom" />
            {form.formState.errors.username ? (
              <div className="error">{form.formState.errors.username.message}</div>
            ) : null}
          </div>

          <div className="col" style={{ gap: 6 }}>
            <div className="fieldLabel">Password</div>
            <input
              className="input"
              type="password"
              {...form.register('password')}
              placeholder="••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            {form.formState.errors.password ? (
              <div className="error">{form.formState.errors.password.message}</div>
            ) : null}
          </div>

          {error ? <div className="error">{error}</div> : null}

          <div className="row" style={{ justifyContent: 'space-between', marginTop: 8, flexWrap: 'wrap' }}>
            <button className="btn btnPrimary" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : mode === 'login' ? 'Login' : 'Register'}
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => {
                setError(null)
                setMode((m) => (m === 'login' ? 'register' : 'login'))
              }}
            >
              Switch to {mode === 'login' ? 'Register' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

