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

## API
| 경로 | 설명 |
|---|---|
| `GET /api/home` | 홈 화면 전체 섹션(배너, TOP10, 드라마, 영화 등) |
| `GET /api/list/{movie\|tv}/{category}` | popular, top_rated, now_playing, upcoming, on_the_air … |
| `GET /api/discover/{movie\|tv}?genre=&lang=` | 장르/언어 필터 |
| `GET /api/detail/{movie\|tv}/{id}` | 상세 + 출연진 + 예고편 + 비슷한 작품 |
| `GET /api/search?q=` | 통합 검색 |
