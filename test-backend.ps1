# Script de Teste do Backend
$BaseUrl = "https://auxiliar-pvd-be.vercel.app"

Write-Host "`n=== TESTE 1: Health Check ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/hello" -Method GET
    Write-Host "✅ Backend está online!" -ForegroundColor Green
    Write-Host "Resposta: $($response | ConvertTo-Json)" -ForegroundColor White
} catch {
    Write-Host "❌ Falha no Health Check: $_" -ForegroundColor Red
}

Write-Host "`n=== TESTE 2: Buscar Configurações ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/config?path=teams" -Method GET
    Write-Host "✅ Config acessível!" -ForegroundColor Green
    Write-Host "Resposta: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor White
} catch {
    Write-Host "⚠️ Config: $_" -ForegroundColor Yellow
}

Write-Host "`n=== TESTE 3: Buscar Policiais ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/police" -Method GET -TimeoutSec 10
    Write-Host "✅ Policiais acessíveis!" -ForegroundColor Green
    $count = ($response.PSObject.Properties | Measure-Object).Count
    Write-Host "Total de policiais: $count" -ForegroundColor White
} catch {
    Write-Host "⚠️ Police: $_" -ForegroundColor Yellow
}

Write-Host "`n=== TESTE 4: Buscar Avaliações de Risco ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/risk-assessments" -Method GET -TimeoutSec 10
    Write-Host "✅ Avaliações acessíveis!" -ForegroundColor Green
    $count = ($response.PSObject.Properties | Measure-Object).Count
    Write-Host "Total de avaliações: $count" -ForegroundColor White
} catch {
    Write-Host "⚠️ Risk Assessments: $_" -ForegroundColor Yellow
}

Write-Host "`n=== TESTE 5: Buscar Vítimas ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/victims" -Method GET -TimeoutSec 10
    Write-Host "✅ Vítimas acessíveis!" -ForegroundColor Green
    $count = ($response.PSObject.Properties | Measure-Object).Count
    Write-Host "Total de vítimas: $count" -ForegroundColor White
} catch {
    Write-Host "⚠️ Victims: $_" -ForegroundColor Yellow
}

Write-Host "`n=== TESTE 6: Buscar REDS ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/reds" -Method GET -TimeoutSec 10
    Write-Host "✅ REDS acessíveis!" -ForegroundColor Green
    $count = ($response.PSObject.Properties | Measure-Object).Count
    Write-Host "Total de REDS: $count" -ForegroundColor White
} catch {
    Write-Host "⚠️ REDS: $_" -ForegroundColor Yellow
}

Write-Host "`n=== TESTE 7: Buscar Dados Gerais ===" -ForegroundColor Cyan
try {
    # Teste sem parâmetro (deve retornar erro)
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/general-data" -Method GET -TimeoutSec 10
    Write-Host "⚠️ General Data sem RG não deveria funcionar" -ForegroundColor Yellow
} catch {
    Write-Host "✅ Validação de RG funcionando (erro esperado sem parâmetro)" -ForegroundColor Green
}

Write-Host "`n=== RESUMO DOS TESTES ===" -ForegroundColor Cyan
Write-Host "Backend URL: $BaseUrl" -ForegroundColor White
Write-Host "Testes concluídos! Verifique os resultados acima." -ForegroundColor Green
Write-Host "`nPara mais detalhes, consulte: backend_test_guide.md" -ForegroundColor Gray
