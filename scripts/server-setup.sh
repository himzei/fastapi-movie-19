#!/usr/bin/env bash
# EC2(Ubuntu 24.04) 최초 1회 설정 스크립트
#   사용법: bash server-setup.sh <GitHub 저장소 주소>
#   공개 저장소: bash server-setup.sh https://github.com/USER/fastapi-movie-19.git
#   비공개 저장소: bash server-setup.sh git@github.com:USER/fastapi-movie-19.git (배포 키 생성)
set -euo pipefail

REPO_URL="${1:?GitHub 저장소 주소를 인자로 주세요}"
APP_DIR="$HOME/app"

echo "==> 1/5 패키지 업데이트 및 Docker 설치"
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl git docker.io docker-compose-v2
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"

echo "==> 2/5 스왑 2GB 추가 (t3.micro 메모리 1GB → 빌드 중 메모리 부족 방지)"
if ! swapon --show | grep -q /swapfile; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

echo "==> 3/5 GitHub 접근 설정"
if [[ "$REPO_URL" == https://* ]]; then
  echo "    공개 저장소(HTTPS) — 배포 키가 필요 없습니다."
else
mkdir -p ~/.ssh && chmod 700 ~/.ssh
if [ ! -f ~/.ssh/github_deploy ]; then
  ssh-keygen -t ed25519 -N "" -C "ec2-deploy" -f ~/.ssh/github_deploy
fi
if ! grep -q "Host github.com" ~/.ssh/config 2>/dev/null; then
  cat >> ~/.ssh/config <<'EOF'
Host github.com
  IdentityFile ~/.ssh/github_deploy
  IdentitiesOnly yes
EOF
  chmod 600 ~/.ssh/config
fi
ssh-keyscan -H github.com >> ~/.ssh/known_hosts 2>/dev/null

echo
echo "------------------------------------------------------------------"
echo " 아래 공개키를 GitHub 저장소 > Settings > Deploy keys 에 등록하세요"
echo " (Allow write access 는 체크하지 않음)"
echo "------------------------------------------------------------------"
cat ~/.ssh/github_deploy.pub
echo "------------------------------------------------------------------"
read -r -p "등록을 마쳤으면 Enter 를 누르세요..." _ </dev/tty
fi

echo "==> 4/5 저장소 클론"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO_URL" "$APP_DIR"
fi

echo "==> 5/5 backend/.env 확인"
if [ ! -f "$APP_DIR/backend/.env" ]; then
  cp "$APP_DIR/backend/.env.example" "$APP_DIR/backend/.env"
  chmod 600 "$APP_DIR/backend/.env"
  echo "!! $APP_DIR/backend/.env 를 만들었습니다. TMDB 키를 입력하세요."
fi

echo
echo "완료. 다시 로그인한 뒤(도커 그룹 반영) 다음을 실행하세요:"
echo "  bash $APP_DIR/scripts/deploy.sh"
