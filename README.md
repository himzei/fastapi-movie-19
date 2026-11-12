# MOVIE19 — FastAPI + React(Vite) TMDB OTT

## 1. TMDB 키 입력
`backend/.env` 를 열어 값을 교체합니다. 둘 중 하나만 있어도 동작하며, 읽기 액세스 토큰이 있으면 우선 사용합니다.

```
TMDB_API_KEY=발급받은_API_키
TMDB_READ_ACCESS_TOKEN=발급받은_읽기_액세스_토큰
```

## 2. 실행 (프로젝트 루트에서)
```powershell
npm run setup    # 최초 1회: 루트/프론트 패키지 + 백엔드 가상환경 설치
npm run dev      # 백엔드(8000) + 프론트(5173) 동시 실행, Ctrl+C 로 둘 다 종료
```
- 사이트: http://localhost:5173 (`/api` 요청은 Vite 프록시로 백엔드에 전달)
- API 문서: http://localhost:8000/docs
- 따로 실행하려면 `npm run dev:back` / `npm run dev:front`

## 3. 배포 (Docker + AWS EC2 + GitHub Actions)

```
git push (master) ─▶ GitHub Actions ─▶ 빌드 검사 ─▶ SSH ─▶ EC2: scripts/deploy.sh
                                                         └─ git pull → docker compose up -d --build → 헬스 체크
```

| 컨테이너 | 내용 |
|---|---|
| `frontend` | Vite 빌드 결과를 nginx 가 서빙(:80), `/api/*` 는 `backend:8000` 으로 프록시 |
| `backend` | FastAPI + uvicorn(:8000, 외부 비공개), TMDB 키는 `backend/.env` 로 주입 |

### 평소 배포
`master` 브랜치에 push 하면 자동 배포됩니다. Actions 탭 > **Deploy to EC2** > *Run workflow* 로 수동 실행도 가능합니다.

### 최초 서버 구축 (1회)
1. EC2(Ubuntu 24.04) 생성, 보안 그룹에서 22/80 포트 허용
2. 서버 설정
   ```bash
   ssh -i 키.pem ubuntu@<EC2_IP> 'bash -s -- https://github.com/<USER>/<REPO>.git' < scripts/server-setup.sh
   ```
3. TMDB 키 복사 (GitHub 에는 올리지 않음)
   ```bash
   ssh -i 키.pem ubuntu@<EC2_IP> 'umask 077; cat > ~/app/backend/.env' < backend/.env
   ```
4. 첫 배포: `ssh -i 키.pem ubuntu@<EC2_IP> 'bash ~/app/scripts/deploy.sh'`
5. GitHub 저장소 Secrets 등록: `EC2_HOST`(IP), `EC2_USER`(`ubuntu`), `EC2_SSH_KEY`(개인키 내용)

### 서버에서 자주 쓰는 명령
```bash
cd ~/app
docker compose ps                 # 컨테이너 상태
docker compose logs -f backend    # 백엔드 로그
bash scripts/deploy.sh <커밋SHA>   # 특정 커밋으로 되돌리기(롤백)
```

## API
| 경로 | 설명 |
|---|---|
| `GET /api/home` | 홈 화면 전체 섹션(배너, TOP10, 드라마, 영화 등) |
| `GET /api/list/{movie\|tv}/{category}` | popular, top_rated, now_playing, upcoming, on_the_air … |
| `GET /api/discover/{movie\|tv}?genre=&lang=` | 장르/언어 필터 |
| `GET /api/detail/{movie\|tv}/{id}` | 상세 + 출연진 + 예고편 + 비슷한 작품 |
| `GET /api/search?q=` | 통합 검색 |
