#!/usr/bin/env bash
set -euo pipefail
mkdir -p reports

# JS/TS/Astro
if [ -f package.json ]; then
  (command -v pnpm >/dev/null && PN=pnpm) || (command -v yarn >/dev/null && PN=yarn) || PN=npm
  $PN install --silent || true
  $PN run -s build || true
  $PN run -s test || true
  npx eslint . || true
  npx prettier -c . || true
  npx tsc --noEmit || true
  $PN audit --json > reports/npm-audit.json || true
fi

# Python
if [ -f requirements.txt ] || [ -f pyproject.toml ]; then
  python -m pip install -U pip || true
  if [ -f requirements.txt ]; then pip install -r requirements.txt || true; fi
  if [ -f pyproject.toml ]; then pip install -e . || true; fi
  pytest -q || true
  ruff check . || true
  ruff format --check . || true
  mypy --ignore-missing-imports || true
  bandit -q -r . -f json -o reports/bandit.json || true
  pip-audit -r requirements.txt -f json -o reports/pip-audit.json || true
fi

# Universal scanners
semgrep --config p/ci --json > reports/semgrep.json || true
gitleaks detect --no-banner -f json -r reports/gitleaks.json || true

# Docker
if [ -f Dockerfile ]; then
  hadolint Dockerfile > reports/hadolint.txt || true
fi
