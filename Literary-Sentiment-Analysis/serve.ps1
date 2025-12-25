param(
  [int]$port = 8001
)

$listener = New-Object System.Net.HttpListener
$prefix = "http://+:$port/"
$listener.Prefixes.Add($prefix)
try{
  $listener.Start()
  Write-Host "Serving files from: $(Get-Location) on http://localhost:$port/"
  Write-Host "Press Ctrl+C to stop."
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    try {
      $request = $context.Request
      $response = $context.Response
      $urlPath = $request.Url.AbsolutePath.TrimStart('/')
      if ([string]::IsNullOrEmpty($urlPath)) { $urlPath = 'index.html' }
      $file = Join-Path (Get-Location) $urlPath
      if (-not (Test-Path $file)) {
        $response.StatusCode = 404
        $response.ContentType = 'text/plain'
        $bytes = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
      } else {
        $bytes = [System.IO.File]::ReadAllBytes($file)
        switch -Regex ($file) {
          '\.css$'  { $response.ContentType = 'text/css' ; break }
          '\.js$'   { $response.ContentType = 'application/javascript' ; break }
          '\.json$' { $response.ContentType = 'application/json' ; break }
          '\.png$'  { $response.ContentType = 'image/png' ; break }
          '\.jpe?g$' { $response.ContentType = 'image/jpeg' ; break }
          '\.svg$'  { $response.ContentType = 'image/svg+xml' ; break }
          default   { $response.ContentType = 'text/html' }
        }
      }
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes,0,$bytes.Length)
      $response.OutputStream.Close()
    } catch {
      Write-Host "Request error: $_"
    }
  }
} catch {
  Write-Host "Server error: $_"
} finally {
  try { $listener.Stop(); $listener.Close() } catch {}
}
