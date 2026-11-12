"""TMDB 프록시 백엔드 (FastAPI).

프론트엔드는 이 서버의 /api/* 만 호출하고, TMDB 키는 서버(.env)에만 둔다.
"""

import asyncio
import os
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(Path(__file__).with_name(".env"))


def _env(name: str, default: str = "") -> str:
    value = os.getenv(name, default).strip()
    # .env 의 안내용 자리표시자는 빈 값으로 취급
    return "" if value.startswith("여기에") else value


TMDB_API_KEY = _env("TMDB_API_KEY")
TMDB_READ_ACCESS_TOKEN = _env("TMDB_READ_ACCESS_TOKEN")
LANGUAGE = _env("TMDB_LANGUAGE", "ko-KR")
REGION = _env("TMDB_REGION", "KR")
FRONTEND_ORIGIN = _env("FRONTEND_ORIGIN", "http://localhost:5173")

TMDB_BASE = "https://api.themoviedb.org/3"

client: httpx.AsyncClient | None = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    global client
    headers = {"accept": "application/json"}
    if TMDB_READ_ACCESS_TOKEN:
        headers["Authorization"] = f"Bearer {TMDB_READ_ACCESS_TOKEN}"
    client = httpx.AsyncClient(base_url=TMDB_BASE, headers=headers, timeout=10)
    yield
    await client.aclose()


app = FastAPI(title="Movie OTT API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_methods=["GET"],
    allow_headers=["*"],
)


async def tmdb(path: str, **params) -> dict:
    if not (TMDB_API_KEY or TMDB_READ_ACCESS_TOKEN):
        raise HTTPException(500, "TMDB 키가 설정되지 않았습니다. backend/.env 를 확인하세요.")
    params.setdefault("language", LANGUAGE)
    if not TMDB_READ_ACCESS_TOKEN:
        params["api_key"] = TMDB_API_KEY
    try:
        res = await client.get(path, params=params)
    except httpx.HTTPError as e:
        raise HTTPException(502, f"TMDB 요청 실패: {e}") from e
    if res.status_code != 200:
        msg = res.json().get("status_message", res.text) if res.content else res.reason_phrase
        raise HTTPException(res.status_code, f"TMDB 오류: {msg}")
    return res.json()


def _normalize(item: dict, media_type: str | None = None) -> dict:
    """영화/TV 응답 필드를 프론트에서 쓰기 쉬운 형태로 통일."""
    mt = item.get("media_type") or media_type or ("tv" if "first_air_date" in item else "movie")
    return {
        "id": item["id"],
        "media_type": mt,
        "title": item.get("title") or item.get("name") or "",
        "original_title": item.get("original_title") or item.get("original_name") or "",
        "overview": item.get("overview") or "",
        "poster_path": item.get("poster_path"),
        "backdrop_path": item.get("backdrop_path"),
        "release_date": item.get("release_date") or item.get("first_air_date") or "",
        "vote_average": round(item.get("vote_average") or 0, 1),
        "genre_ids": item.get("genre_ids", []),
        "adult": item.get("adult", False),
    }


def _list(data: dict, media_type: str | None = None, need_poster: bool = True) -> list[dict]:
    results = [
        _normalize(i, media_type)
        for i in data.get("results", [])
        if i.get("media_type", media_type) in ("movie", "tv", None)
    ]
    return [r for r in results if r["poster_path"]] if need_poster else results


# ------------------------------------------------------------------ routes


@app.get("/api/health")
async def health():
    return {"ok": True, "tmdb_configured": bool(TMDB_API_KEY or TMDB_READ_ACCESS_TOKEN)}


@app.get("/api/home")
async def home():
    """홈 화면에 필요한 섹션을 한 번에 병렬 조회."""
    sections = {
        "trending": ("/trending/all/day", None, {}),
        "top10": ("/trending/all/week", None, {}),
        "korean_drama": ("/discover/tv", "tv", {"with_original_language": "ko", "sort_by": "popularity.desc"}),
        "now_playing": ("/movie/now_playing", "movie", {"region": REGION}),
        "popular_movie": ("/movie/popular", "movie", {"region": REGION}),
        "popular_tv": ("/tv/popular", "tv", {}),
        "variety": ("/discover/tv", "tv", {"with_original_language": "ko", "with_genres": "10764|10767"}),
        "anime": ("/discover/tv", "tv", {"with_genres": "16", "with_original_language": "ja"}),
        "top_rated": ("/movie/top_rated", "movie", {}),
        "upcoming": ("/movie/upcoming", "movie", {"region": REGION}),
    }
    keys = list(sections)
    results = await asyncio.gather(
        *(tmdb(path, **params) for path, _, params in sections.values()),
        return_exceptions=True,
    )
    out = {}
    for key, res in zip(keys, results):
        if isinstance(res, Exception):
            if isinstance(res, HTTPException) and res.status_code in (401, 500):
                raise res  # 인증 문제는 그대로 노출
            out[key] = []
            continue
        out[key] = _list(res, sections[key][1])
    # 히어로 배너: 배경 이미지가 있는 트렌딩 작품
    out["hero"] = [i for i in out["trending"] if i["backdrop_path"]][:6]
    out["top10"] = out["top10"][:10]
    return out


@app.get("/api/list/{media_type}/{category}")
async def list_category(media_type: str, category: str, page: int = 1):
    allowed = {
        "movie": {"popular", "now_playing", "top_rated", "upcoming"},
        "tv": {"popular", "top_rated", "on_the_air", "airing_today"},
    }
    if category not in allowed.get(media_type, set()):
        raise HTTPException(404, "지원하지 않는 카테고리입니다.")
    data = await tmdb(f"/{media_type}/{category}", page=page, region=REGION)
    return {"page": data.get("page"), "total_pages": data.get("total_pages"), "results": _list(data, media_type)}


@app.get("/api/discover/{media_type}")
async def discover(media_type: str, genre: str | None = None, lang: str | None = None, page: int = 1):
    if media_type not in ("movie", "tv"):
        raise HTTPException(404, "movie 또는 tv 만 가능합니다.")
    params = {"page": page, "sort_by": "popularity.desc"}
    if genre:
        params["with_genres"] = genre
    if lang:
        params["with_original_language"] = lang
    data = await tmdb(f"/discover/{media_type}", **params)
    return {"page": data.get("page"), "total_pages": data.get("total_pages"), "results": _list(data, media_type)}


@app.get("/api/genres/{media_type}")
async def genres(media_type: str):
    if media_type not in ("movie", "tv"):
        raise HTTPException(404, "movie 또는 tv 만 가능합니다.")
    return (await tmdb(f"/genre/{media_type}/list")).get("genres", [])


@app.get("/api/detail/{media_type}/{item_id}")
async def detail(media_type: str, item_id: int):
    if media_type not in ("movie", "tv"):
        raise HTTPException(404, "movie 또는 tv 만 가능합니다.")
    data = await tmdb(
        f"/{media_type}/{item_id}",
        append_to_response="credits,videos,similar,release_dates,content_ratings",
        include_video_language="ko,en",
    )
    base = _normalize(data, media_type)
    videos = data.get("videos", {}).get("results", [])
    trailer = next(
        (v for v in videos if v.get("site") == "YouTube" and v.get("type") in ("Trailer", "Teaser")),
        None,
    )
    cast = [
        {"id": c["id"], "name": c["name"], "character": c.get("character", ""), "profile_path": c.get("profile_path")}
        for c in data.get("credits", {}).get("cast", [])[:12]
    ]
    crew = data.get("credits", {}).get("crew", [])
    directors = [c["name"] for c in crew if c.get("job") == "Director"]
    creators = [c["name"] for c in data.get("created_by", [])]
    return {
        **base,
        "genres": [g["name"] for g in data.get("genres", [])],
        "runtime": data.get("runtime") or (data.get("episode_run_time") or [None])[0],
        "number_of_seasons": data.get("number_of_seasons"),
        "number_of_episodes": data.get("number_of_episodes"),
        "tagline": data.get("tagline") or "",
        "directors": directors or creators,
        "cast": cast,
        "trailer_key": trailer["key"] if trailer else None,
        "similar": _list(data.get("similar", {}), media_type)[:12],
    }


@app.get("/api/search")
async def search(q: str = Query(..., min_length=1), page: int = 1):
    data = await tmdb("/search/multi", query=q, page=page, include_adult="false")
    return {"page": data.get("page"), "total_pages": data.get("total_pages"), "results": _list(data)}
