# Script para testar PIX via Vercel (usa sessão CLI autenticada) e redeploy do frontend
# Uso: editar $BackendUrl se necessário, depois executar no PowerShell:
#   cd <repo-root>
#   .\scripts\run-pix-and-redeploy.ps1

param(
  [string]$BackendUrl = 'https://backend-bldvjet7p-danielbaisso-dels-projects.vercel.app'
)

Write-Host "Usando BACKEND URL: $BackendUrl"

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  Write-Error "Vercel CLI não encontrado. Instale com: npm i -g vercel e faça vercel login"
  exit 1
}

Write-Host "=== Teste: criar PIX via vercel curl ==="
$pixPayload = '{"amount":2500,"description":"Teste PIX","external_reference":"TEST123"}'
try {
  # passar argumentos para o curl interno do Vercel depois de --
  $args = @('-X','POST','-H','Content-Type: application/json','-d',$pixPayload)
  $response = & vercel curl "$BackendUrl/api/payments/pix" -- @args 2>&1
  Write-Host "Resposta (raw):"
  Write-Host $response
} catch {
  Write-Error "Erro ao executar vercel curl: $_"
}

Write-Host "`n=== Redeploy do frontend ==="
if (-not (Test-Path "frontend")) {
  Write-Warning "Pasta frontend não encontrada. Pule o redeploy manualmente: cd frontend; vercel --prod"
} else {
  Push-Location frontend
  try {
    vercel --prod
  } catch {
    Write-Error "Erro no deploy do frontend: $_"
  }
  Pop-Location
}

Write-Host "\nPronto. Se ocorreram erros, cole a saída aqui e eu ajudo a interpretar." 
