# Скрипт для регистрации KSC Token Pool в FireFly
# Используется после развертывания контракта

Write-Host "========================================" -ForegroundColor Blue
Write-Host "  🔗 Registering KSC Token Pool" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

$contractAddress = "0x42699A7612A82f1d9C36148af9C77354759b210b"
$fireflyUrl = "http://localhost:5000"
$signingKey = "0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73"

# Проверяем, существует ли контракт
Write-Host "[1/3] Checking if contract exists..." -ForegroundColor Yellow
$checkBody = @{
    jsonrpc = "2.0"
    method = "eth_getCode"
    params = @($contractAddress, "latest")
    id = 1
} | ConvertTo-Json

try {
    $codeResponse = Invoke-RestMethod -Uri "http://localhost:8545" -Method Post -Body $checkBody -ContentType "application/json"
    $code = $codeResponse.result
    
    if ($code -eq "0x" -or $code -eq $null) {
        Write-Host "❌ Contract does NOT exist at $contractAddress" -ForegroundColor Red
        Write-Host "   Please deploy the contract first: npm run deploy:ksc" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "✅ Contract exists!" -ForegroundColor Green
        Write-Host "   Code length: $($code.Length) bytes" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error checking contract: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Проверяем существующие pools
Write-Host "[2/3] Checking existing pools..." -ForegroundColor Yellow
try {
    $pools = Invoke-RestMethod -Uri "$fireflyUrl/api/v1/namespaces/default/tokens/pools" -Method Get
    $existingPool = $pools.value | Where-Object { $_.config.address -eq $contractAddress }
    
    if ($existingPool) {
        Write-Host "✅ Pool already exists!" -ForegroundColor Green
        Write-Host "   Pool ID: $($existingPool.id)" -ForegroundColor Cyan
        Write-Host "   Name: $($existingPool.name)" -ForegroundColor Cyan
        exit 0
    } else {
        Write-Host "   No existing pool found" -ForegroundColor Gray
    }
} catch {
    Write-Host "   No pools found (this is OK)" -ForegroundColor Gray
}

Write-Host ""

# Регистрируем pool
Write-Host "[3/3] Registering token pool..." -ForegroundColor Yellow
$poolBody = @{
    name = "KSC-Token"
    type = "fungible"
    symbol = "KSC"
    config = @{
        address = $contractAddress
        blockNumber = "0"
    }
    key = $signingKey
} | ConvertTo-Json -Depth 5

try {
    $response = Invoke-RestMethod -Uri "$fireflyUrl/api/v1/namespaces/default/tokens/pools?publish=true" `
        -Method Post `
        -Body $poolBody `
        -ContentType "application/json"
    
    Write-Host "✅ Token pool registered successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Pool Details:" -ForegroundColor Cyan
    Write-Host "   ID: $($response.id)" -ForegroundColor White
    Write-Host "   Name: $($response.name)" -ForegroundColor White
    Write-Host "   Symbol: $($response.symbol)" -ForegroundColor White
    Write-Host "   Connector: $($response.connector)" -ForegroundColor White
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ SUCCESS!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to register pool" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
    exit 1
}

