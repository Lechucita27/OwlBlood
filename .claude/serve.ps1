param([int]$Port=8765)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Serving $root on $prefix"
$mime = @{
  ".html"="text/html; charset=utf-8"
  ".htm" ="text/html; charset=utf-8"
  ".js"  ="application/javascript; charset=utf-8"
  ".css" ="text/css; charset=utf-8"
  ".png" ="image/png"
  ".jpg" ="image/jpeg"
  ".jpeg"="image/jpeg"
  ".gif" ="image/gif"
  ".svg" ="image/svg+xml"
  ".ico" ="image/x-icon"
  ".json"="application/json; charset=utf-8"
  ".woff"="font/woff"
  ".woff2"="font/woff2"
  ".map" ="application/json; charset=utf-8"
}
try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    try {
      $rel = [uri]::UnescapeDataString($req.Url.AbsolutePath)
      if ($rel -eq "/" -or $rel -eq "") { $rel = "/index.html" }
      $path = Join-Path $root ($rel.TrimStart('/'))
      if (Test-Path $path -PathType Container) { $path = Join-Path $path "index.html" }
      if (Test-Path $path -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($path).ToLower()
        $ct = $mime[$ext]; if (-not $ct) { $ct = "application/octet-stream" }
        $bytes = [System.IO.File]::ReadAllBytes($path)
        $res.ContentType = $ct
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $res.StatusCode = 404
        $msg = [Text.Encoding]::UTF8.GetBytes("404 Not Found: $rel")
        $res.OutputStream.Write($msg, 0, $msg.Length)
      }
    } catch {
      $res.StatusCode = 500
      $msg = [Text.Encoding]::UTF8.GetBytes("500: $($_.Exception.Message)")
      try { $res.OutputStream.Write($msg, 0, $msg.Length) } catch {}
    } finally {
      try { $res.Close() } catch {}
    }
  }
} finally {
  $listener.Stop()
}
