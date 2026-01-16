import { useState } from 'react'

function App() {
  const [apiKey, setApiKey] = useState('')
  const [question, setQuestion] = useState('')
  const [queryResults, setQueryResults] = useState(null)
  const [error, setError] = useState('')
  const [questionLoading, setQuestionLoading] = useState(false)

  const askQuestion = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key')
      return
    }

    if (!question.trim()) {
      setError('Please enter a question')
      return
    }

    setQuestionLoading(true)
    setError('')
    setQueryResults(null)

    try {
      const response = await fetch('http://127.0.0.1:8000/ask-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({ question })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to get answer')
      }

      const data = await response.json()
      setQueryResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setQuestionLoading(false)
    }
  }

  const handleQuestionKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      askQuestion()
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: '#000000', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
          Multi-tenant Document System
        </h1>
        <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '40px' }}>
          Enter your API key and ask questions about your documents
        </p>

        {/* API Key and Question Section */}
        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #9ca3af' }}>
          <label style={{ display: 'block', color: '#374151', fontWeight: '500', marginBottom: '8px' }}>
            API Key
          </label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key (e.g., tenantA_key)"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #9ca3af',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              marginBottom: '20px',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#000000'}
            onBlur={(e) => e.target.style.borderColor = '#9ca3af'}
          />
          <label style={{ display: 'block', color: '#374151', fontWeight: '500', marginBottom: '8px' }}>
            Ask a Question
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleQuestionKeyPress}
              placeholder="Ask a question about your documents..."
              rows="3"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #9ca3af',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#000000'}
              onBlur={(e) => e.target.style.borderColor = '#9ca3af'}
            />
            <button
              onClick={askQuestion}
              disabled={questionLoading || !apiKey.trim()}
              style={{
                padding: '12px 32px',
                backgroundColor: questionLoading || !apiKey.trim() ? '#9ca3af' : '#000000',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: questionLoading || !apiKey.trim() ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                alignSelf: 'flex-end'
              }}
              onMouseEnter={(e) => !questionLoading && apiKey.trim() && (e.target.style.backgroundColor = '#374151')}
              onMouseLeave={(e) => !questionLoading && apiKey.trim() && (e.target.style.backgroundColor = '#000000')}
            >
              {questionLoading ? 'Searching...' : 'Ask Question'}
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

        {/* Query Results Section */}
        {queryResults && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ color: '#000000', fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
              Results for: "{queryResults.question}"
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
              Client: {queryResults.client_name} | Found {queryResults.results?.length || 0} document(s)
            </p>
            
            {queryResults.results && queryResults.results.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {queryResults.results.map((result, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#f8f9fa',
                      padding: '24px',
                      borderRadius: '12px',
                      border: '1px solid #9ca3af'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <h3 style={{ color: '#000000', fontSize: '16px', fontWeight: '600' }}>
                        {result.metadata?.file_name || `Document ${index + 1}`}
                      </h3>
                      {result.distance !== null && result.distance !== undefined && (
                        <span style={{
                          backgroundColor: '#000000',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          Relevance: {(1 - result.distance).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p style={{
                      color: '#4b5563',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontSize: '14px'
                    }}>
                      {result.document}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#6b7280',
                border: '1px solid #9ca3af'
              }}>
                <p>{queryResults.message || 'No relevant documents found'}</p>
              </div>
            )}
          </div>
        )}


      </div>
    </div>
  )
}

export default App
