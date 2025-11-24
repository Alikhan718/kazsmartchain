# 🧪 KazSmartChain - Тестирование системы (PowerShell)
# Скрипт для проверки работоспособности всех сервисов

$ErrorActionPreference = "Continue"

Write-Host "🧪 ==========================================" -ForegroundColor Blue
Write-Host "   KazSmartChain - Тестирование" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue
Write-Host ""

# Счетчики
$script:Passed = 0
$script:Failed = 0

# Функция для тестирования HTTP endpoints
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testing $Name... " -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq $ExpectedStatus -or $response.StatusCode -eq 200) {
            Write-Host "✅ PASS" -ForegroundColor Green -NoNewline
            Write-Host " (HTTP $($response.StatusCode))"
            $script:Passed++
            return $true
        } else {
            Write-Host "❌ FAIL" -ForegroundColor Red -NoNewline
            Write-Host " (HTTP $($response.StatusCode), expected $ExpectedStatus)"
            $script:Failed++
            return $false
        }
    } catch {
        Write-Host "❌ FAIL" -ForegroundColor Red -NoNewline
        Write-Host " (Error: $($_.Exception.Message))"
        $script:Failed++
        return $false
    }
}

# Функция для тестирования JSON-RPC
function Test-JsonRpc {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method,
        [string]$Params = "[]"
    )
    
    Write-Host "Testing $Name ($Method)... " -NoNewline
    
    try {
        $body = @{
            jsonrpc = "2.0"
            method = $Method
            params = @()
            id = 1
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri $Url -Method Post -Body $body -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.result -ne $null) {
            Write-Host "✅ PASS" -ForegroundColor Green
            $script:Passed++
            return $true
        } else {
            Write-Host "❌ FAIL" -ForegroundColor Red
            Write-Host "Response: $($response | ConvertTo-Json)"
            $script:Failed++
            return $false
        }
    } catch {
        Write-Host "❌ FAIL" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
        $script:Failed++
        return $false
    }
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "[1/6] Testing Infrastructure" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

Test-Endpoint "IPFS API" "http://localhost:5001/api/v0/version"
Test-Endpoint "IPFS Gateway" "http://localhost:8080/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "[2/6] Testing Hyperledger Besu" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

Test-JsonRpc "Besu - eth_blockNumber" "http://localhost:8545" "eth_blockNumber"
Test-JsonRpc "Besu - net_version" "http://localhost:8545" "net_version"
Test-JsonRpc "Besu - eth_chainId" "http://localhost:8545" "eth_chainId"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "[3/6] Testing Hyperledger FireFly" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

Test-Endpoint "FireFly Status" "http://localhost:5000/api/v1/status"
Test-Endpoint "FireFly Namespaces" "http://localhost:5000/api/v1/namespaces"

Write-Host ""
Write-Host "Getting FireFly namespace details..." -ForegroundColor Yellow
try {
    $namespace = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/namespaces/default" -ErrorAction Stop
    Write-Host ($namespace | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "Could not get namespace details" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "[4/6] Testing Solana" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

Test-JsonRpc "Solana - getVersion" "http://localhost:8899" "getVersion"
Test-JsonRpc "Solana - getHealth" "http://localhost:8899" "getHealth"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "[5/6] Testing API Backend" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

Write-Host "Waiting for API to be ready..." -ForegroundColor Yellow
for ($i = 1; $i -le 30; $i++) {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:4000" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        break
    } catch {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
}
Write-Host ""

Test-Endpoint "API Health" "http://localhost:4000/health"
Test-Endpoint "API Docs" "http://localhost:4000/api"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "[6/6] Testing Web Frontend" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

Write-Host "Waiting for Web to be ready..." -ForegroundColor Yellow
for ($i = 1; $i -le 30; $i++) {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        break
    } catch {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
}
Write-Host ""

Test-Endpoint "Web Frontend" "http://localhost:3000"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "Summary" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""
Write-Host "Tests Passed: " -NoNewline
Write-Host $script:Passed -ForegroundColor Green
Write-Host "Tests Failed: " -NoNewline
Write-Host $script:Failed -ForegroundColor Red
Write-Host ""

if ($script:Failed -eq 0) {
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "  ✅ All tests passed!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 KazSmartChain is fully operational!" -ForegroundColor Blue
    Write-Host ""
    exit 0
} else {
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host "  ❌ Some tests failed" -ForegroundColor Red
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check logs: docker-compose -f docker-compose.simple.yml logs"
    Write-Host "  2. Check status: docker-compose -f docker-compose.simple.yml ps"
    Write-Host "  3. Wait a bit longer and retry (services may still be initializing)"
    Write-Host ""
    exit 1
}

