# Скрипт для мониторинга системы KazSmartChain

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   KazSmartChain - Мониторинг" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Статус контейнеров
Write-Host "Статус контейнеров:" -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml ps --format "table {{.Name}}\t{{.Status}}"
Write-Host ""

# Проверка доступности сервисов
Write-Host "Проверка доступности:" -ForegroundColor Yellow

# FireFly
try {
    $ff = Invoke-RestMethod -Uri http://localhost:5000/api/v1/status -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  ✓ FireFly: OK (namespace: $($ff.namespace.name))" -ForegroundColor Green
} catch {
    Write-Host "  ✗ FireFly: Недоступен" -ForegroundColor Red
}

# Besu
try {
    $body = @{jsonrpc='2.0';method='eth_blockNumber';params=@();id=1} | ConvertTo-Json
    $besu = Invoke-RestMethod -Uri http://localhost:8545 -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 2 -ErrorAction Stop
    $blockNum = [Convert]::ToInt32($besu.result, 16)
    Write-Host "  ✓ Besu: OK (блок #$blockNum)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Besu: Недоступен" -ForegroundColor Red
}

# API
try {
    $api = Invoke-RestMethod -Uri http://localhost:4000/api/health -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  ✓ API: OK" -ForegroundColor Green
} catch {
    Write-Host "  ✗ API: Еще запускается..." -ForegroundColor Yellow
}

# Web
try {
    $web = Invoke-WebRequest -Uri http://localhost:3000 -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "  ✓ Web: OK" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Web: Еще запускается..." -ForegroundColor Yellow
}

Write-Host ""

# Логи API (последние 5 строк)
Write-Host "Последние логи API:" -ForegroundColor Yellow
docker logs kaz-api 2>&1 | Select-Object -Last 5
Write-Host ""

# Логи Web (последние 5 строк)
Write-Host "Последние логи Web:" -ForegroundColor Yellow
docker logs kaz-web 2>&1 | Select-Object -Last 5
Write-Host ""

Write-Host "Для просмотра логов в реальном времени:" -ForegroundColor Cyan
Write-Host "  docker-compose -f docker-compose.simple.yml logs -f api" -ForegroundColor Gray
Write-Host "  docker-compose -f docker-compose.simple.yml logs -f web" -ForegroundColor Gray
Write-Host ""

