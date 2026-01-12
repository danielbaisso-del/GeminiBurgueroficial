<#
Scripts/setup-vercel.ps1

Uso: no Windows PowerShell execute:
  $env:VERCEL_TOKEN = '<your-vercel-token>'
  .\scripts\setup-vercel.ps1

O script procura um projeto Vercel com o mesmo nome do repositório,
cria/atualiza as variáveis `VITE_API_URL` e `VITE_GEMINI_API_KEY` no projeto
e sugere o comando para disparar o deploy (`npx vercel --prod`).

OBS: é necessário fornecer um `VERCEL_TOKEN` com acesso ao projeto.
#>

param(
    [string]$Token,
    [string]$ProjectName,
    [string]$TeamId,
    [string]$ViteApiUrl,
    [string]$ViteGeminiKey
)

function Read-Input($prompt, $default = '') {
    if ($default -ne '') { $prompt = "$($prompt) [$default]: " }
    else { $prompt = "$($prompt): " }
    $val = Read-Host -Prompt $prompt
    if ([string]::IsNullOrWhiteSpace($val)) { return $default }
    return $val
}

if ($Token) {
    $token = $Token
} else {
    $token = $env:VERCEL_TOKEN
    if (-not $token) {
        Write-Host "VERCEL_TOKEN não encontrado. Exporte a variável ou cole o token agora." -ForegroundColor Yellow
        $token = Read-Host -Prompt "Cole VERCEL_TOKEN (visível)"
    }
}
if (-not $token) { Write-Error "Vercel token necessário. Abortando."; exit 1 }

# Determine project name: priority -> parameter, git remote, prompt
if ($ProjectName) {
    $repoName = $ProjectName
} else {
    try {
        $gitUrl = git remote get-url origin 2>$null
        if ($gitUrl) {
            $m = [regex]::Match($gitUrl, '[:/](?<owner>[^/]+)/(?<repo>[^/.]+)')
            if ($m.Success) { $repoName = $m.Groups['repo'].Value }
        }
    } catch { $gitUrl = $null }

    if (-not $repoName) { $repoName = Read-Input "Vercel project name (repo)" (Split-Path -Leaf (Get-Location)) }
}
Write-Host "Procurando projeto Vercel com nome: $repoName"

# Prepare headers
$headers = @{ Authorization = "Bearer $token"; 'User-Agent' = 'setup-vercel-script' }

# Build projects URI (optionally for team)
try {
    $projectsUri = "https://api.vercel.com/v1/projects"
    if ($TeamId) { $projectsUri += "?teamId=$TeamId" }
    $projects = Invoke-RestMethod -Uri $projectsUri -Headers $headers -Method Get
} catch {
    Write-Error ("Erro ao listar projetos Vercel: " + $_.ToString())
    exit 1
}

# Normalize response: some endpoints return an array, others an object with .projects
if ($projects -is [System.Array]) {
    $projectList = $projects
} elseif ($projects.projects) {
    $projectList = $projects.projects
} else {
    $projectList = @()
}

$project = $projectList | Where-Object { $_.name -ieq $repoName } | Select-Object -First 1
if (-not $project) {
    Write-Host "Projeto não encontrado no Vercel com o nome '$repoName'." -ForegroundColor Yellow
    Write-Host "Crie o projeto no Vercel via web UI (import from GitHub) e depois execute novamente este script." -ForegroundColor Yellow
    exit 1
}

$projectId = $project.id
Write-Host "Projeto encontrado: $($project.name) (id: $projectId)"

# Env values: prefer CLI params, otherwise prompt
if ($ViteApiUrl) { $defaultApi = $ViteApiUrl } else { $defaultApi = Read-Input "Valor para VITE_API_URL" "https://api.example.com/api" }
if ($ViteGeminiKey) { $defaultGemini = $ViteGeminiKey } else { $defaultGemini = Read-Input "Valor para VITE_GEMINI_API_KEY" "" }

$envs = @{
    VITE_API_URL = $defaultApi
    VITE_GEMINI_API_KEY = $defaultGemini
}

foreach ($k in $envs.Keys) {
    $v = $envs[$k]
    if ([string]::IsNullOrWhiteSpace($v)) {
        Write-Host "Pulando variável $k porque valor está vazio." -ForegroundColor Yellow
        continue
    }

    $body = @{ key = $k; value = $v; type = 'encrypted'; target = @('production') } | ConvertTo-Json -Depth 5
    try {
        Write-Host "Criando/atualizando variável $k..."
        $resp = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$projectId/env" -Headers $headers -Method Post -Body $body -ContentType 'application/json'
        Write-Host "OK: $k criado/atualizado"
    } catch {
        Write-Warning ('Falha ao definir ' + $k + ': ' + $_.ToString())
    }
}

Write-Host "
Variáveis definidas (verifique no painel Vercel):"
$envs.GetEnumerator() | ForEach-Object { Write-Host " - $($_.Key) = $($_.Value)" }

# Check if vercel CLI is installed
try {
    $ver = & vercel --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Vercel CLI detectado: $ver" -ForegroundColor Green
        $deploy = Read-Input "Deseja rodar 'npx vercel --prod' agora? (y/N)" "N"
        if ($deploy -match '^[yY]') {
            Push-Location frontend
            npx vercel --prod --confirm
            Pop-Location
        } else {
            Write-Host "Para implantar manualmente execute: (na pasta 'frontend')`n  npx vercel --prod`n" -ForegroundColor Cyan
        }
    } else {
        Write-Host "Vercel CLI não encontrado. Para implantar execute manualmente: (na pasta 'frontend')`n  npx vercel --prod`n" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Vercel CLI não encontrado. Para implantar execute manualmente: (na pasta 'frontend')`n  npx vercel --prod`n" -ForegroundColor Cyan
}

Write-Host "Script finalizado. Verifique a página do projeto no Vercel para confirmar as variáveis e o deploy." -ForegroundColor Green
