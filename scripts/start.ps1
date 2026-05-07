$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$bundledNode = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$node = $null

try {
  $candidate = Get-Command node -ErrorAction SilentlyContinue
  if ($candidate) {
    & $candidate.Source --version | Out-Null
    $node = $candidate.Source
  }
} catch {
  $node = $null
}

if (-not $node -and (Test-Path $bundledNode)) {
  $node = $bundledNode
}

if (-not $node) {
  throw "Node.js was not found. Install Node 20+ or run from Codex with the bundled runtime available."
}

Set-Location $root
& $node "server/static.mjs"
