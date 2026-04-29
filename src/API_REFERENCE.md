# VoiceRep AI - API Reference

## Widget API

### Initialize Widget
```html
<script 
  src="https://your-domain.com/voicerep-widget.js" 
  data-api-key="vrep_xxx_yyy"
  data-api-url="https://your-backend.com/api"
></script>
```

**Parameters:**
- `data-api-key` (required) - Client API key from dashboard
- `data-api-url` (optional) - Backend API base URL (defaults to https://voicerep.app/api)

### Widget Events (Future)
```javascript
// Listen for widget events (coming soon)
window.addEventListener('voicerep-command-complete', (event) => {
  console.log('Command result:', event.detail.result);
});
```

---

## Backend API Endpoints

### 1. Verify API Key
```
POST /verifyApiKey
```

**Request:**
```json
{
  "api_key": "vrep_xxx"
}
```

**Response:**
```json
{
  "valid": true,
  "client_id": "abc123",
  "company_name": "Acme Corp",
  "enabled_tools": ["cold_call_script"],
  "widget_config": {
    "primary_color": "#000",
    "position": "bottom-right"
  }
}
```

---

### 2. Transcribe Audio
```
POST /transcribeAudio
Content-Type: application/json
Authorization: Bearer {api_key}
```

**Request:**
```json
{
  "client_id": "abc123",
  "audio_url": "https://storage.com/audio.mp3",
  "command_id": "cmd_123" // optional
}
```

**Response:**
```json
{
  "success": true,
  "transcription": "Generate a cold call script for TechCorp"
}
```

---

### 3. Parse Intent
```
POST /parseIntent
Content-Type: application/json
```

**Request:**
```json
{
  "transcription": "Generate a cold call script for TechCorp",
  "enabled_tools": ["cold_call_script", "follow_up_email"],
  "command_id": "cmd_123"
}
```

**Response:**
```json
{
  "success": true,
  "detected_intent": "cold_call_script",
  "confidence": 0.95,
  "parameters": {
    "company": "TechCorp",
    "industry": "tech"
  }
}
```

---

### 4. Execute Command
```
POST /executeCommand
Content-Type: application/json
```

**Request:**
```json
{
  "client_id": "abc123",
  "detected_intent": "cold_call_script",
  "parameters": {
    "company": "TechCorp",
    "industry": "tech"
  },
  "command_id": "cmd_123"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "content": "Hi [Name], I came across TechCorp...",
    "metadata": {
      "template": "cold_call_opener"
    }
  }
}
```

---

### 5. Track Usage
```
POST /trackUsage
Content-Type: application/json
```

**Request:**
```json
{
  "client_id": "abc123",
  "request_type": "transcription_requests",
  "command_id": "cmd_123"
}
```

**Response:**
```json
{
  "success": true,
  "usage": {
    "current_month": "2026-04-01",
    "total_requests_this_month": 42,
    "monthly_quota": 1000,
    "quota_exceeded": false,
    "requests_remaining": 958
  }
}
```

---

### 6. Upload Audio
```
POST /uploadAudio
Content-Type: multipart/form-data
X-API-Key: vrep_xxx
```

**Form Data:**
- `file` (required) - Audio file (multipart)

**Response:**
```json
{
  "success": true,
  "audio_url": "https://storage.com/audio/abc123.mp3",
  "client_id": "abc123"
}
```

---

### 7. Process Command (Full Pipeline)
```
POST /processCommand
Content-Type: application/json
X-API-Key: vrep_xxx
```

**Request:**
```json
{
  "audio_url": "https://storage.com/audio.mp3",
  "client_id": "abc123"
}
```

**Response:**
```json
{
  "success": true,
  "command_id": "cmd_123",
  "transcription": "Generate a cold call script",
  "detected_intent": "cold_call_script",
  "intent_confidence": 0.95,
  "parameters": {
    "company": "TechCorp"
  },
  "result": {
    "content": "Hi [Name]..."
  },
  "processing_time_ms": 2341
}
```

---

### 8. Initialize Test Data (Admin Only)
```
POST /initTestData
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Test data created",
  "test_client_id": "test_123",
  "test_api_key": "vrep_test_xxx",
  "commands_created": 4
}
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Invalid API key",
  "status": 401
}
```

**Common Status Codes:**
- `400` - Bad Request (missing fields)
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (account suspended)
- `404` - Not Found (client not found)
- `500` - Server Error

---

## Data Models

### Client
```typescript
{
  id: string;
  company_name: string;
  api_key: string;
  heyrichy_account_id: string;
  webhook_url?: string;
  widget_config: {
    widget_title: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    brand_logo_url?: string;
    enabled_tools: string[];
  };
  monthly_quota: number;
  status: 'active' | 'suspended' | 'inactive';
  created_date: string;
  created_by: string;
  updated_date: string;
}
```

### Command
```typescript
{
  id: string;
  client_id: string;
  audio_url: string;
  transcription?: string;
  detected_intent?: string;
  intent_confidence?: number;
  parameters?: object;
  execution_result?: object;
  status: 'pending' | 'transcribing' | 'parsing' | 'executing' | 'completed' | 'failed';
  error_message?: string;
  processing_time_ms?: number;
  created_date: string;
  updated_date: string;
}
```

### UsageMeter
```typescript
{
  id: string;
  client_id: string;
  month: string; // YYYY-MM-01
  total_requests: number;
  transcription_requests: number;
  intent_parsing_requests: number;
  execution_requests: number;
  failed_requests: number;
  average_response_time_ms: number;
  cost_estimate: number;
  created_date: string;
  updated_date: string;
}
```

---

## Authentication

### API Key Authentication
```
X-API-Key: vrep_xxx_yyy
```

OR in request body:
```json
{
  "api_key": "vrep_xxx_yyy"
}
```

### Bearer Token (Admin)
```
Authorization: Bearer {user_token}
```

---

## Rate Limiting (Future)

Currently unlimited. Will implement:
- Per-client quota (configurable monthly limit)
- Per-minute rate limit (coming)
- Burst allowance (coming)

---

## Webhooks (Future)

Optional webhook delivery for command completion:

```
POST {client.webhook_url}
```

**Payload:**
```json
{
  "event": "command.completed",
  "command_id": "cmd_123",
  "client_id": "abc123",
  "result": {
    "intent": "cold_call_script",
    "output": "Hi [Name]..."
  },
  "timestamp": "2026-04-29T12:34:56Z"
}
```

---

## Integration Guide

### Step 1: Get API Key
Create client in dashboard → Copy API key from ClientsList

### Step 2: Embed Widget
```html
<script 
  src="https://voicerep.app/voicerep-widget.js" 
  data-api-key="YOUR_KEY_HERE">
</script>
```

### Step 3: Test
Record a voice command using the widget

### Step 4: Monitor
Check dashboard Command History for results

---

## Code Examples

### JavaScript (Widget Integration)
```javascript
// Widget auto-initializes, no manual code needed
// Just add the script tag with data-api-key
```

### JavaScript (Manual API Call)
```javascript
const response = await fetch('https://api.voicerep.app/processCommand', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'vrep_xxx'
  },
  body: JSON.stringify({
    audio_url: 'https://storage.com/audio.mp3',
    client_id: 'abc123'
  })
});

const data = await response.json();
console.log('Result:', data.result);
```

### cURL
```bash
curl -X POST https://api.voicerep.app/processCommand \
  -H "Content-Type: application/json" \
  -H "X-API-Key: vrep_xxx" \
  -d '{
    "audio_url": "https://storage.com/audio.mp3",
    "client_id": "abc123"
  }'
```

### Python
```python
import requests

response = requests.post(
  'https://api.voicerep.app/processCommand',
  headers={
    'X-API-Key': 'vrep_xxx'
  },
  json={
    'audio_url': 'https://storage.com/audio.mp3',
    'client_id': 'abc123'
  }
)

result = response.json()
print(result['result'])
```

---

## Support

For issues or questions:
1. Check function comments (marked with TODO)
2. Review VOICEREP_SETUP.md
3. Check Command History in dashboard for error details
4. Verify API key in dashboard

---

**Last Updated:** 2026-04-29
**API Version:** 1.0