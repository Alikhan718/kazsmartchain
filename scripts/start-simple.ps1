# KazSmartChain - Simple Start Script
# Quick start for all services

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "   KazSmartChain - Starting..." -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker not installed" -ForegroundColor Red
    exit 1
}

if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker Compose not installed" -ForegroundColor Red
    exit 1
}

Write-Host "Docker OK" -ForegroundColor Green
Write-Host ""

# Stop old containers
Write-Host "Stopping old containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml down 2>$null
Write-Host ""

# Ask to remove old data
$response = Read-Host "Remove old data? (y/N)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "Removing volumes..." -ForegroundColor Yellow
    docker-compose -f docker-compose.simple.yml down -v
    Write-Host "Volumes removed" -ForegroundColor Green
}
Write-Host ""

# Start services
Write-Host "Starting containers..." -ForegroundColor Blue
Write-Host ""

# Step 1: Infrastructure
Write-Host "[1/5] Starting infrastructure (Postgres, Redis, IPFS)..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml up -d postgres redis ipfs
Write-Host "Infrastructure started" -ForegroundColor Green
Write-Host ""

Write-Host "Waiting 10 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 2: Besu
Write-Host "[2/5] Starting Hyperledger Besu..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml up -d besu
Write-Host "Besu started" -ForegroundColor Green
Write-Host ""

Write-Host "Waiting 30 seconds for Besu..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Step 3: FireFly
Write-Host "[3/5] Starting Hyperledger FireFly..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml up -d firefly
Write-Host "FireFly started" -ForegroundColor Green
Write-Host ""

Write-Host "Waiting 60 seconds for FireFly..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Step 4: Solana
Write-Host "[4/5] Starting Solana Test Validator..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml up -d solana-validator
Write-Host "Solana started" -ForegroundColor Green
Write-Host ""

Write-Host "Waiting 20 seconds for Solana..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Step 5: API and Web
Write-Host "[5/5] Starting API and Web..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml up -d api web
Write-Host "API and Web started" -ForegroundColor Green
Write-Host ""

# Check status
Write-Host "Checking status..." -ForegroundColor Blue
Write-Host ""
docker-compose -f docker-compose.simple.yml ps
Write-Host ""

# Health checks
Write-Host "Checking services health..." -ForegroundColor Blue
Write-Host ""

function Test-Service {
    param($Name, $Url)
    Write-Host "  Checking $Name... " -NoNewline
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "OK" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "Not ready" -ForegroundColor Red
        return $false
    }
}

Test-Service "IPFS" "http://localhost:5001/api/v0/version"
Test-Service "FireFly" "http://localhost:5000/api/v1/status"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  KazSmartChain started successfully!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Available services:" -ForegroundColor Blue
Write-Host ""
Write-Host "  FireFly API:      http://localhost:5000/api"
Write-Host "  Besu RPC:         http://localhost:8545"
Write-Host "  IPFS API:         http://localhost:5001"
Write-Host "  Solana RPC:       http://localhost:8899"
Write-Host "  API Backend:      http://localhost:4000"
Write-Host "  Web Frontend:     http://localhost:3000"
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  # View logs"
Write-Host "  docker-compose -f docker-compose.simple.yml logs -f"
Write-Host ""
Write-Host "  # View specific service logs"
Write-Host "  docker-compose -f docker-compose.simple.yml logs -f firefly"
Write-Host ""
Write-Host "  # Stop"
Write-Host "  docker-compose -f docker-compose.simple.yml down"
Write-Host ""
Write-Host "  # Test"
Write-Host "  .\scripts\test-simple.ps1"
Write-Host ""
Write-Host "API and Web are initializing, wait 2-3 more minutes..." -ForegroundColor Blue
Write-Host ""
