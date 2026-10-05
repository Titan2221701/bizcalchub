# Run from any directory: powershell -File tools/build-locales.ps1
$ErrorActionPreference = 'Stop'
$env:PYTHONUTF8 = '1'
$env:PYTHONIOENCODING = 'utf-8'
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
python -X utf8 "$PSScriptRoot/build_locales.py"
if ($LASTEXITCODE -ne 0) { throw 'Multilingual build failed.' }
python -X utf8 "$PSScriptRoot/../tests/check_locales.py"
if ($LASTEXITCODE -ne 0) { throw 'Multilingual validation failed.' }
python -X utf8 "$PSScriptRoot/../tests/check_launch_readiness.py"
if ($LASTEXITCODE -ne 0) { throw 'Launch readiness validation failed.' }
