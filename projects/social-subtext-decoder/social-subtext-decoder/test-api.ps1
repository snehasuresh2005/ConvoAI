#!/usr/bin/env pwsh
# Test Script for Speech Practice Mode

Write-Host "🧪 Testing Speech Practice Mode API Endpoints" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Test 1: Get situations
Write-Host "`n1️⃣  Testing GET /api/practice/situations" -ForegroundColor Green
try {
  $situations = Invoke-WebRequest -Uri "http://localhost:3001/api/practice/situations" `
    -Method GET -UseBasicParsing -ErrorAction Stop
  $data = $situations.Content | ConvertFrom-Json
  Write-Host "✅ Success! Found $($data.data.Count) practice situations:" -ForegroundColor Green
  $data.data | ForEach-Object { Write-Host "   • $($_.title)" }
} catch {
  Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 2: Create practice session
Write-Host "`n2️⃣  Testing POST /api/practice/session" -ForegroundColor Green
try {
  $body = @{
    sessionId = "test-session-$(Get-Random)"
    situationType = "restaurant"
    outputMode = "voice"
    avatarEnabled = $true
  } | ConvertTo-Json
  
  $session = Invoke-WebRequest -Uri "http://localhost:3001/api/practice/session" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body `
    -UseBasicParsing -ErrorAction Stop
  
  $data = $session.Content | ConvertFrom-Json
  Write-Host "✅ Success! Created practice session:" -ForegroundColor Green
  Write-Host "   Session ID: $($data.data.practiceSessionId)" -ForegroundColor Cyan
  Write-Host "   Initial Message: $($data.data.initialMessage.Substring(0,50))..." -ForegroundColor Cyan
  
  # Store session ID for next test
  $Global:practiceSessionId = $data.data.practiceSessionId
  
} catch {
  Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# Test 3: Send practice message
if ($Global:practiceSessionId) {
  Write-Host "`n3️⃣  Testing POST /api/practice/message" -ForegroundColor Green
  try {
    $body = @{
      practiceSessionId = $Global:practiceSessionId
      userMessage = "I'd like a table for two by the window, please."
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/practice/message" `
      -Method POST `
      -Headers @{"Content-Type"="application/json"} `
      -Body $body `
      -UseBasicParsing -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Success! Received AI response:" -ForegroundColor Green
    Write-Host "   Response: $($data.data.aiResponse)" -ForegroundColor Cyan
    
  } catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
  }
}

# Test 4: End practice session
if ($Global:practiceSessionId) {
  Write-Host "`n4️⃣  Testing POST /api/practice/end" -ForegroundColor Green
  try {
    $body = @{
      practiceSessionId = $Global:practiceSessionId
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/practice/end" `
      -Method POST `
      -Headers @{"Content-Type"="application/json"} `
      -Body $body `
      -UseBasicParsing -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Success! Session ended:" -ForegroundColor Green
    Write-Host "   Duration: $($data.data.duration)s" -ForegroundColor Cyan
    Write-Host "   Total Exchanges: $($data.data.totalExchanges)" -ForegroundColor Cyan
    
  } catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
  }
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✨ API Testing Complete!" -ForegroundColor Green
Write-Host "Frontend running on: http://localhost:5173/practice" -ForegroundColor Cyan
