import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'

type TabKey = 'random' | 'manage' | 'stats'

function prettyIndex(index: number) {
  return `${index + 1}.`
}

export default function DashboardPage() {
  const [tab, setTab] = useState<TabKey>('random')

  const {
    data: jokesData,
    isLoading: jokesLoading,
    error: jokesError,
    refetch: refetchJokes,
  } = useQuery({
    queryKey: ['jokes'],
    queryFn: async () => api.jokes.list(undefined),
    staleTime: 15000,
  })

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['jokes_stats'],
    queryFn: async () => api.jokes.stats(undefined),
    staleTime: 15000,
  })

  const jokes = jokesData?.jokes ?? []
  const [randomLoading, setRandomLoading] = useState(false)
  const [randomJoke, setRandomJoke] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const randomBox = useMemo(() => {
    if (randomLoading) return 'Loading a fresh joke...'
    if (randomJoke) return randomJoke
    return 'Click "Get random joke" to start.'
  }, [randomLoading, randomJoke])

  const getRandom = async () => {
    setActionError(null)
    setRandomLoading(true)
    try {
      const res = await api.jokes.random(undefined)
      setRandomJoke(res.joke)
      await refetchStats()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to get joke')
    } finally {
      setRandomLoading(false)
    }
  }

  const [newJoke, setNewJoke] = useState('')
  const [addLoading, setAddLoading] = useState(false)

  const addJoke = async () => {
    setActionError(null)
    const text = newJoke.trim()
    if (!text) {
      setActionError('Please enter a joke.')
      return
    }

    setAddLoading(true)
    try {
      await api.jokes.add('', { joke_text: text })
      setNewJoke('')
      await refetchJokes()
      await refetchStats()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to add joke')
    } finally {
      setAddLoading(false)
    }
  }

  const deleteJoke = async (index: number) => {
    setActionError(null)
    try {
      await api.jokes.delete('', index)
      await refetchJokes()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to delete joke')
    }
  }

  return (
    <div className="page">
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap' }}>
          <div className="col" style={{ gap: 4 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-h)' }}>😂 Joke Generator</div>
            <div style={{ fontSize: 13, color: 'var(--text-h)', opacity: 0.6 }}>Your daily dose of laughs</div>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <button className="btn" type="button" onClick={() => refetchJokes()}>
              Refresh
            </button>
          </div>
        </div>

        <div className="tabs" role="tablist" aria-label="Dashboard tabs" style={{ marginBottom: 16 }}>
          <button
            className={`tab ${tab === 'random' ? 'tabActive' : ''}`}
            onClick={() => setTab('random')}
            type="button"
            role="tab"
            aria-selected={tab === 'random'}
          >
            Random joke
          </button>
          <button
            className={`tab ${tab === 'manage' ? 'tabActive' : ''}`}
            onClick={() => setTab('manage')}
            type="button"
            role="tab"
            aria-selected={tab === 'manage'}
          >
            Manage jokes
          </button>
          <button
            className={`tab ${tab === 'stats' ? 'tabActive' : ''}`}
            onClick={() => setTab('stats')}
            type="button"
            role="tab"
            aria-selected={tab === 'stats'}
          >
            Statistics
          </button>
        </div>

        {actionError ? <div className="error" style={{ marginBottom: 12 }}>{actionError}</div> : null}

        {tab === 'random' ? (
          <div className="col" style={{ gap: 14 }}>
            <div className="jokeBox" aria-live="polite">
              {randomBox}
            </div>
            <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <button className="btn btnPrimary" type="button" onClick={getRandom} disabled={randomLoading}>
                {randomLoading ? (
                  <>
                    <span className="spinner" style={{ marginRight: 8 }} />
                    Fetching...
                  </>
                ) : (
                  'Get random joke'
                )}
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setRandomJoke(null)
                  setActionError(null)
                }}
              >
                Clear
              </button>
            </div>
          </div>
        ) : null}

        {tab === 'manage' ? (
          <div className="col" style={{ gap: 14 }}>
            <div className="divider" />
            <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 420px' }}>
                <div className="fieldLabel">Add a new joke</div>
                <input
                  className="input"
                  value={newJoke}
                  onChange={(e) => setNewJoke(e.target.value)}
                  placeholder="Type a joke (it will be validated and saved)"
                />
              </div>
              <div style={{ minWidth: 180 }}>
                <div className="fieldLabel" style={{ visibility: 'hidden' }}>
                  Add
                </div>
                <button className="btn btnPrimary" type="button" onClick={addJoke} disabled={addLoading}>
                  {addLoading ? (
                    <>
                      <span className="spinner" style={{ marginRight: 8 }} />
                      Saving...
                    </>
                  ) : (
                    'Add joke'
                  )}
                </button>
              </div>
            </div>

            <div className="divider" />

            <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>All jokes</h2>
              <div style={{ fontSize: 12, color: 'var(--text-h)' }}>{jokesLoading ? 'Loading...' : `${jokes.length} total`}</div>
            </div>

            {jokesError ? <div className="error">Failed to load jokes.</div> : null}
            {jokesLoading ? <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span className="spinner" />Loading jokes...</div> : null}

            {!jokesLoading && jokes.length === 0 ? (
              <div className="success">No jokes yet. Add one above.</div>
            ) : null}

            <div className="list" aria-label="joke list">
              {jokes.map((j, i) => (
                <div className="listItem" key={`${j}-${i}`}>
                  <div className="listItemText">
                    <div style={{ fontSize: 12, color: 'var(--text-h)', marginBottom: 4 }}>{prettyIndex(i)}</div>
                    {j}
                  </div>
                  <button className="btn btnDanger" type="button" onClick={() => deleteJoke(i)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tab === 'stats' ? (
          <div className="col" style={{ gap: 12 }}>
            <div className="divider" />
            <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Top displayed jokes</h2>
              <button className="btn" type="button" onClick={() => refetchStats()} disabled={statsLoading}>
                {statsLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {statsError ? <div className="error">Failed to load statistics.</div> : null}
            {statsLoading ? <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span className="spinner" />Loading stats...</div> : null}

            {!statsLoading && !statsData?.top?.length ? <div className="success">No statistics yet. Click "Get random joke".</div> : null}

            {!statsLoading && statsData?.top?.length ? (
              <div className="list">
                {statsData.top.map((item, idx) => (
                  <div className="listItem" key={`${item.joke}-${idx}`}>
                    <div className="listItemText">
                      <div style={{ fontSize: 12, color: 'var(--text-h)', marginBottom: 4 }}>{idx + 1}.</div>
                      {item.joke}
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--accent)', paddingTop: 2 }}>{item.count}×</div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
