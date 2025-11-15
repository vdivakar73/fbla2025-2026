# Start local web server for Ardey Kell Lost and Found Services
# This removes the file:// protocol and serves the site over HTTP

Write-Host "Starting web server for Ardey Kell Lost and Found Services..." -ForegroundColor Green
Write-Host ""

# Change to the project directory
Set-Location "c:\Users\bhanu\lost-and-found\fbla2025-2026\FBLA Project"

# Start the Python HTTP server on port 8000
Write-Host "Server running on http://localhost:8000" -ForegroundColor Cyan
Write-Host "Open in browser: http://localhost:8000/Html Fbla project 2025.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Yellow
Write-Host ""

python -m http.server 8000
