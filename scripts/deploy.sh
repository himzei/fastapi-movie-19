#!/usr/bin/env bash
# EC2 에서 실행되는 배포 스크립트 (GitHub Actions 가 SSH 로 호출, 수동 실행도 가능)
#   사용법: bash ~/app/scripts/deploy.sh [커밋 SHA 또는 브랜치, 기본값 master]
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/app}"
TARGET="${1:-master}"

cd "$APP_DIR"

# 동시에 두 번 배포되지 않도록 잠금
exec 9>/tmp/movie19-deploy.lock
flock -n 9 || { echo "다른 배포가 진행 중입니다."; exit 1; }

if [ ! -f backend/.env ]; then
  echo "backend/.env 가 없습니다. TMDB 키를 먼저 설정하세요." >&2
  exit 1
fi

echo "==> 코드 갱신 ($TARGET)"
git fetch --prune origin
if git rev-parse --verify --quiet "origin/$TARGET" >/dev/null; then
  git reset --hard "origin/$TARGET"
else
  git reset --hard "$TARGET"
fi
# backend/.env 는 .gitignore 대상이라 reset 에 영향받지 않음
echo "    현재 커밋: $(git log -1 --pretty='%h %s')"

echo "==> 이미지 빌드 및 컨테이너 교체"
docker compose up -d --build --remove-orphans

echo "==> 헬스 체크"
for i in $(seq 1 30); do
  if curl -fsS http://localhost/api/health >/dev/null 2>&1; then
    echo "    정상 응답: $(curl -fsS http://localhost/api/health)"
    docker image prune -f >/dev/null
    echo "==> 배포 완료"
    exit 0
  fi
  sleep 2
done

echo "!! 헬스 체크 실패. 최근 로그:" >&2
docker compose ps
docker compose logs --tail=50
exit 1
