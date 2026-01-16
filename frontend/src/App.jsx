import { useState } from 'react'

function App() {
  const [apiKey, setApiKey] = useState('')
  const [documents, setDocuments] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchDocuments = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key')
      return
    }

    setLoading(true)
    setError('')
    setDocuments([])

    try {
      const response = await fetch('http://127.0.0.1:8000/client-docs', {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to fetch documents')
      }

      const data = await response.json()
      setDocuments(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchDocuments()
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: '#000000', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
          Multi-tenant Document System
        </h1>
        <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '40px' }}>
          Enter your API key to access your documents
        </p>

        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #9ca3af' }}>
          <label style={{ display: 'block', color: '#374151', fontWeight: '500', marginBottom: '8px' }}>
            API Key
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your API key (e.g., tenantA_key)"
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #9ca3af',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#000000'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            <button
              onClick={fetchDocuments}
              disabled={loading}
              style={{
                padding: '12px 32px',
                backgroundColor: loading ? '#9ca3af' : '#000000',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#374151')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#000000')}
            >
              {loading ? 'Loading...' : 'Fetch Documents'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <strong style={{ fontWeight: '600' }}>Error:</strong> {error}
          </div>
        )}

        {documents.length > 0 && (
          <div>
            <h2 style={{ color: '#000000', fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
              Your Documents ({documents.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {documents.map((doc, index) => (
                <div
                  key={doc.id || index}
                  style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid #9ca3af'
                  }}
                >
                  <h3 style={{ color: '#000000', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                    {doc.title}
                  </h3>
                  <p style={{
                    color: '#4b5563',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}>
                    {doc.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && documents.length === 0 && apiKey && (
          <div style={{
            backgroundColor: 'white',
            padding: '48px',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <p>No documents found for this API key</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
