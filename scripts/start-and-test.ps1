<#
Automação local para testar o app (Windows PowerShell)

O que o script faz:
- Copia .env.example -> backend/.env e .env.local.example -> frontend/.env.local (se não existirem)
- Instala dependências em backend e frontend
- Gera Prisma client e executa seed (se o script existir)
- Inicia backend e frontend em janelas separadas (processos) e testa /health e /

Uso:
  Abra PowerShell como Administrador e rode:
    powershell -ExecutionPolicy Bypass -File scripts\start-and-test.ps1

Observação: o script inicia processos em janelas separadas para que você veja logs.
Feche as janelas para parar os servidores, ou use `taskkill /F /IM node.exe`.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Push-Location $PSScriptRoot\..
$repo = Get-Location
Write-Output "Repo root: $repo"

function Ensure-Copy($src, $dst) {
    if (-not (Test-Path $dst)) {
        if (Test-Path $src) {
            Copy-Item $src $dst -Force
            Write-Output "Copied $src -> $dst"
        } else {
            Write-Output "Aviso: $src não existe; pulei cópia para $dst"
        }
    } else {
        Write-Output "$dst já existe; pulando cópia"
    }
}

Ensure-Copy -src 'backend\.env.example' -dst 'backend\.env'
Ensure-Copy -src 'frontend\.env.local.example' -dst 'frontend\.env.local'

Write-Output 'Instalando dependências (backend) ...'
Push-Location backend
npm install
Pop-Location

Write-Output 'Instalando dependências (frontend) ...'
Push-Location frontend
npm install
Pop-Location

# Prisma generate + seed (backend)
Push-Location backend
if (Test-Path 'node_modules') {
    Write-Output 'Gerando Prisma client...'
    npx prisma generate

    if ((Get-Content package.json | Out-String) -match 'prisma:seed') {
        Write-Output 'Executando seed: npm run prisma:seed'
        npm run prisma:seed
    } else {
        Write-Output 'Nenhum script prisma:seed encontrado; pulando seed'
    }
} else {
    Write-Output 'node_modules ausente no backend; verifique install'
}
Pop-Location

Start-Sleep -Seconds 1

Write-Output 'Iniciando backend em nova janela (logs visíveis)...'
Start-Process -FilePath 'powershell' -ArgumentList '-NoExit','-Command','cd backend; npx tsx src/server.ts' -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Output 'Iniciando frontend em nova janela (logs visíveis)...'
Start-Process -FilePath 'powershell' -ArgumentList '-NoExit','-Command','cd frontend; npm run dev' -WindowStyle Normal

Write-Output 'Aguardando serviços inicializarem...'
Start-Sleep -Seconds 6

function Test-Url($url) {
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
        Write-Output "[OK] $url -> $($r.StatusCode)"
        return $r
    } catch {
        Write-Output "[ERRO] $url -> $($_.Exception.Message)"
        return $null
    }
}

Test-Url 'http://localhost:3333/health'
Test-Url 'http://localhost:3333/'
Test-Url 'http://localhost:5173/'

Write-Output 'Script finalizado. Verifique as janelas abertas para logs e interaja no browser.'

Pop-Location
