# Simple PowerShell HTTP Server for Ardey Kell Lost and Found Services
# No Python or Node required - pure PowerShell

$projectPath = "c:\Users\bhanu\lost-and-found\fbla2025-2026\FBLA Project"
$port = 8000
$url = "http://localhost:$port"

Write-Host "Starting PowerShell HTTP Server..." -ForegroundColor Green
Write-Host "Serving files from: $projectPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open in browser: $url/Html Fbla project 2025.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Yellow
Write-Host ""

# Create HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("$url/")

try {
    $listener.Start()
    Write-Host "Server is running on $url" -ForegroundColor Green
    
    while ($true) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath
        if ($path -eq "/" -or $path -eq "") {
            $path = "/Html Fbla project 2025.html"
        }
        
        $filePath = Join-Path $projectPath ($path -replace "^/", "")
        
        if (Test-Path $filePath -PathType Leaf) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = Get-ContentType $filePath
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $response.StatusDescription = "Not Found"
            $errorMsg = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found: $path")
            $response.OutputStream.Write($errorMsg, 0, $errorMsg.Length)
        }
        
        $response.OutputStream.Close()
    }
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
finally {
    $listener.Stop()
    $listener.Close()
}

function Get-ContentType {
    param($file)
    $ext = [System.IO.Path]::GetExtension($file).ToLower()
    switch ($ext) {
        ".html" { return "text/html" }
        ".htm" { return "text/html" }
        ".css" { return "text/css" }
        ".js" { return "application/javascript" }
        ".json" { return "application/json" }
        ".png" { return "image/png" }
        ".jpg" { return "image/jpeg" }
        ".jpeg" { return "image/jpeg" }
        ".gif" { return "image/gif" }
        ".svg" { return "image/svg+xml" }
        ".ico" { return "image/x-icon" }
        default { return "application/octet-stream" }
    }
}
