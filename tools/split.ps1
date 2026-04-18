param(
  [string]$Source = "index.html",
  [string]$OutDir = "src"
)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root $Source
$out = Join-Path $root $OutDir
if (-not (Test-Path $out)) { New-Item -ItemType Directory -Path $out | Out-Null }

# Read all lines (1-indexed logical; 0-indexed array)
$lines = [System.IO.File]::ReadAllLines($src)

# Ranges are 1-indexed inclusive, matching editor line numbers
# Boundaries below map to JS-only section starts/ends within <script>...</script>
$ranges = @(
  @{ File = "01-core.js";     Start = 17;   End = 403;  Header = "// Constantes, biomas, util, SoundSystem, drawRR, OWL_SPECIES" },
  @{ File = "02-render.js";   Start = 405;  End = 1402; Header = "// Render helpers: shade, drawOwl, blood, drawOwlDeath, lerpColor, drawPizza, drawSpeciesAttack" },
  @{ File = "03-entities.js"; Start = 1404; End = 2391; Header = "// Camera, rarezas, armas, Bullet, BotOwl, Platform(es), Enemies, SpikeTrap, Pizza, SecretBlock" },
  @{ File = "04-player.js";   Start = 2393; End = 3350; Header = "// Chick, CompanionOwl, Player" },
  @{ File = "05-game.js";     Start = 3351; End = 4311; Header = "// buildLevel y clase Game" },
  @{ File = "06-main.js";     Start = 4313; End = 4316; Header = "// Bootstrap: window.onload" }
)

foreach ($r in $ranges) {
  $slice = $lines[($r.Start - 1)..($r.End - 1)]
  $content = @($r.Header, "") + $slice
  $target = Join-Path $out $r.File
  [System.IO.File]::WriteAllLines($target, $content, (New-Object System.Text.UTF8Encoding $false))
  Write-Host ("Wrote {0}  ({1} lines)" -f $r.File, ($r.End - $r.Start + 1))
}

# Rewrite index.html shell
$shell = @"
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>OwlBlood - La Pizza Sangrienta</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:#1a1a2e; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:monospace; overflow:hidden; }
    canvas { border:3px solid #444; border-radius:4px; display:block; }
    #info { color:#888; font-size:11px; margin-top:6px; letter-spacing:1px; }
  </style>
</head>
<body>
<canvas id="gameCanvas" width="800" height="450"></canvas>
<div id="info">← → A D mover | ↑ W ESPACIO saltar | Z / E = GARRAS | Bloque ? cada 20s = aliada</div>

<!-- Módulos clásicos (orden importa: comparten scope global) -->
<script src="src/01-core.js"></script>
<script src="src/02-render.js"></script>
<script src="src/03-entities.js"></script>
<script src="src/04-player.js"></script>
<script src="src/05-game.js"></script>
<script src="src/06-main.js"></script>
</body>
</html>
"@
[System.IO.File]::WriteAllText((Join-Path $root "index.html"), $shell, (New-Object System.Text.UTF8Encoding $false))
Write-Host "Rewrote index.html as shell"
