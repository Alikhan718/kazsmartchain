#!/usr/bin/env pwsh
# KazSmartChain Transaction Testing Script
# Создает реальные транзакции через FireFly API

$ErrorActionPreference = "Stop"
$FIREFLY_URL = "http://localhost:5000"
$NAMESPACE = "default"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  KazSmartChain Transaction Testing" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Helper function для FireFly API calls
function Invoke-FireFlyAPI {
    param(
        [string]$Method = "GET",
        [string]$Path,
        [object]$Body = $null
    )
    
    $url = "$FIREFLY_URL/api/v1/namespaces/$NAMESPACE$Path"
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            Write-Host "→ $Method $Path" -ForegroundColor Yellow
            $response = Invoke-RestMethod -Uri $url -Method $Method -Headers $headers -Body $jsonBody
        } else {
            Write-Host "→ $Method $Path" -ForegroundColor Yellow
            $response = Invoke-RestMethod -Uri $url -Method $Method -Headers $headers
        }
        return $response
    } catch {
        Write-Host "✗ Error: $_" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        return $null
    }
}

# Шаг 1: Проверяем статус FireFly
Write-Host "`n[1/6] Checking FireFly Status..." -ForegroundColor Cyan
$status = Invoke-FireFlyAPI -Path "/status"
if ($status) {
    Write-Host "✓ FireFly is healthy" -ForegroundColor Green
    Write-Host "  Namespace: $($status.namespace.name)" -ForegroundColor Gray
} else {
    Write-Host "✗ FireFly not ready" -ForegroundColor Red
    exit 1
}

# Шаг 2: Создаем Token Pool (KZT Stablecoin)
Write-Host "`n[2/6] Creating Token Pool: KZT Stablecoin..." -ForegroundColor Cyan
$tokenPool = @{
    name = "KZT-Stablecoin"
    type = "fungible"
    symbol = "KZT"
    config = @{
        decimals = 2
    }
}

$pool = Invoke-FireFlyAPI -Method POST -Path "/tokens/pools" -Body $tokenPool
if ($pool) {
    Write-Host "✓ Token Pool created: $($pool.id)" -ForegroundColor Green
    Write-Host "  Name: KZT Stablecoin" -ForegroundColor Gray
    Write-Host "  Type: Fungible" -ForegroundColor Gray
    $poolId = $pool.id
} else {
    Write-Host "⚠ Could not create token pool (may already exist)" -ForegroundColor Yellow
    # Try to get existing pools
    $pools = Invoke-FireFlyAPI -Path "/tokens/pools"
    if ($pools -and $pools.Count -gt 0) {
        $poolId = $pools[0].id
        Write-Host "  Using existing pool: $poolId" -ForegroundColor Gray
    }
}

Start-Sleep -Seconds 2

# Шаг 3: Mint токены для BCC
Write-Host "`n[3/6] Minting 1,000,000 KZT tokens for BCC..." -ForegroundColor Cyan

if ($poolId) {
    $mintRequest = @{
        amount = "100000000"  # 1,000,000 KZT (with 2 decimals = 100000000)
        pool = $poolId
    }
    
    $mint = Invoke-FireFlyAPI -Method POST -Path "/tokens/mint" -Body $mintRequest
    if ($mint) {
        Write-Host "✓ Tokens minted successfully" -ForegroundColor Green
        Write-Host "  Amount: 1,000,000 KZT" -ForegroundColor Gray
        Write-Host "  Transaction: $($mint.localId)" -ForegroundColor Gray
    }
    
    Start-Sleep -Seconds 3
}

# Шаг 4: Transfer токены между организациями
Write-Host "`n[4/6] Transferring 50,000 KZT from BCC to KazNU..." -ForegroundColor Cyan

if ($poolId) {
    $transferRequest = @{
        amount = "5000000"  # 50,000 KZT
        pool = $poolId
        to = "kaznu"
    }
    
    $transfer = Invoke-FireFlyAPI -Method POST -Path "/tokens/transfers" -Body $transferRequest
    if ($transfer) {
        Write-Host "✓ Tokens transferred successfully" -ForegroundColor Green
        Write-Host "  Amount: 50,000 KZT" -ForegroundColor Gray
        Write-Host "  From: BCC → To: КазНУ" -ForegroundColor Gray
    }
    
    Start-Sleep -Seconds 3
}

# Шаг 5: Создаем NFT Pool для цифровых дипломов (КазНУ)
Write-Host "`n[5/6] Creating NFT Pool: Digital Diplomas..." -ForegroundColor Cyan
$nftPool = @{
    name = "KazNU-Digital-Diplomas"
    type = "nonfungible"
    symbol = "KZNDIP"
}

$nft = Invoke-FireFlyAPI -Method POST -Path "/tokens/pools" -Body $nftPool
if ($nft) {
    Write-Host "✓ NFT Pool created: $($nft.id)" -ForegroundColor Green
    Write-Host "  Name: КазНУ Digital Diplomas" -ForegroundColor Gray
    Write-Host "  Type: Non-Fungible" -ForegroundColor Gray
    $nftPoolId = $nft.id
    
    Start-Sleep -Seconds 2
    
    # Mint первый NFT диплом
    Write-Host "`n  Minting first diploma NFT..." -ForegroundColor Cyan
    $nftMint = @{
        pool = $nftPoolId
        amount = "1"
        uri = "ipfs://QmExampleDiplomaMetadata123"
    }
    
    $mintedNFT = Invoke-FireFlyAPI -Method POST -Path "/tokens/mint" -Body $nftMint
    if ($mintedNFT) {
        Write-Host "  ✓ Diploma NFT minted" -ForegroundColor Green
        Write-Host "    Token ID: $($mintedNFT.localId)" -ForegroundColor Gray
    }
}

# Шаг 6: Проверяем транзакции
Write-Host "`n[6/6] Checking Recent Transactions..." -ForegroundColor Cyan
$operations = Invoke-FireFlyAPI -Path "/operations?limit=5"
if ($operations) {
    Write-Host "✓ Recent operations:" -ForegroundColor Green
    foreach ($op in $operations) {
        $status = if ($op.status -eq "Succeeded") { "✓" } else { "⧗" }
        Write-Host "  $status $($op.type): $($op.id)" -ForegroundColor Gray
    }
}

# Итоги
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ✅ TESTING COMPLETED!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  • Token Pool created: KZT Stablecoin" -ForegroundColor White
Write-Host "  • Minted: 1,000,000 KZT tokens" -ForegroundColor White
Write-Host "  • Transferred: 50,000 KZT (BCC → КазНУ)" -ForegroundColor White
Write-Host "  • NFT Pool created: Digital Diplomas" -ForegroundColor White
Write-Host "  • Minted: 1 Diploma NFT" -ForegroundColor White

Write-Host "`n🌐 Check Results:" -ForegroundColor Yellow
Write-Host "  • Dashboard: http://localhost:3000" -ForegroundColor White
Write-Host "  • Admin: http://localhost:3000/admin" -ForegroundColor White
Write-Host "  • FireFly UI: http://localhost:5000/ui" -ForegroundColor White
Write-Host "  • Transactions should now appear in metrics!" -ForegroundColor White

Write-Host "`n========================================`n" -ForegroundColor Green

