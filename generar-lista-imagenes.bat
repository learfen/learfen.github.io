@echo off
cd games/images
if exist index.html del index.html
powershell -Command "Get-ChildItem -File | Where-Object { $_.Name -notlike '.*' } | Select-Object -ExpandProperty Name | ConvertTo-Json | Out-File -Encoding utf8 index.html"