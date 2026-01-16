# Backend - Multi-tenant Document API

## Prerequisites

- Python 3.8+
- pip

## Installation

1. Navigate to the backend directory:

```powershell
cd backend
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

## Running the Server

From the `backend` directory, run:

```powershell
uvicorn app.main:app --reload
```

The server will start at: `http://127.0.0.1:8000`

## Testing

### Health Check

```powershell
curl http://127.0.0.1:8000/
```

### Test Client A

```powershell
curl -H "X-API-Key: tenantA_key" http://127.0.0.1:8000/client-docs
```

### Test Client B

```powershell
curl -H "X-API-Key: tenantB_key" http://127.0.0.1:8000/client-docs
```

### Test with Postman

1. **Health Check:**

   - Method: `GET`
   - URL: `http://127.0.0.1:8000/`

2. **Get Client A Documents:**

   - Method: `GET`
   - URL: `http://127.0.0.1:8000/client-docs`
   - Headers tab → Add:
     - Key: `X-API-Key`
     - Value: `tenantA_key`

3. **Get Client B Documents:**

   - Method: `GET`
   - URL: `http://127.0.0.1:8000/client-docs`
   - Headers tab → Add:
     - Key: `X-API-Key`
     - Value: `tenantB_key`

4. **Test Invalid API Key (should return 403):**
   - Method: `GET`
   - URL: `http://127.0.0.1:8000/client-docs`
   - Headers tab → Add:
     - Key: `X-API-Key`
     - Value: `invalid_key`

## API Endpoints

- `GET /` - Health check
- `GET /client-docs` - Get documents for authenticated client (requires `X-API-Key` header)

## Multi-tenant Isolation

Each client is isolated via API key:

- Client A uses: `tenantA_key`
- Client B uses: `tenantB_key`

Clients can only access their own documents.
