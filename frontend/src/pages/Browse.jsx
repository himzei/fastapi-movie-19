import { useEffect, useState } from "react";
import { api } from "../api.js";
import HeroBanner from "../components/HeroBanner.jsx";
import Row from "../components/Row.jsx";
import Status from "../components/Status.jsx";

// 메뉴별 섹션 구성: [제목, 데이터 요청 함수, 카드 형태]
const CONFIG = {
  drama: [
    ["인기 한국 드라마", () => api.discover("tv", { lang: "ko", genre: "18" }), "top10"],
    ["방영 중인 시리즈", () => api.list("tv", "on_the_air"), "poster"],
    ["로맨스·코미디 드라마", () => api.discover("tv", { lang: "ko", genre: "35" }), "wide"],
    ["범죄·미스터리", () => api.discover("tv", { lang: "ko", genre: "80|9648" }), "poster"],
    ["해외 인기 시리즈", () => api.list("tv", "popular"), "poster"],
    ["평점이 높은 시리즈", () => api.list("tv", "top_rated"), "poster"],
  ],
  variety: [
    ["인기 예능", () => api.discover("tv", { lang: "ko", genre: "10764|10767" }), "top10"],
    ["리얼리티", () => api.discover("tv", { lang: "ko", genre: "10764" }), "wide"],
    ["토크쇼", () => api.discover("tv", { lang: "ko", genre: "10767" }), "poster"],
    ["해외 리얼리티", () => api.discover("tv", { genre: "10764" }), "poster"],
    ["다큐멘터리", () => api.discover("tv", { genre: "99" }), "poster"],
  ],
  movie: [
    ["인기 영화 TOP 10", () => api.list("movie", "popular"), "top10"],
    ["극장 상영 중", () => api.list("movie", "now_playing"), "wide"],
    ["한국 영화", () => api.discover("movie", { lang: "ko" }), "poster"],
    ["액션", () => api.discover("movie", { genre: "28" }), "poster"],
    ["코미디", () => api.discover("movie", { genre: "35" }), "poster"],
    ["로맨스", () => api.discover("movie", { genre: "10749" }), "poster"],
    ["공포·스릴러", () => api.discover("movie", { genre: "27|53" }), "poster"],
    ["평점이 높은 명작", () => api.list("movie", "top_rated"), "poster"],
    ["개봉 예정작", () => api.list("movie", "upcoming"), "wide"],
  ],
  anime: [
    ["인기 애니 시리즈", () => api.discover("tv", { genre: "16", lang: "ja" }), "top10"],
    ["애니메이션 영화", () => api.discover("movie", { genre: "16" }), "wide"],
    ["극장판 일본 애니", () => api.discover("movie", { genre: "16", lang: "ja" }), "poster"],
    ["키즈·가족", () => api.discover("tv", { genre: "10762" }), "poster"],
    ["한국 애니메이션", () => api.discover("tv", { genre: "16", lang: "ko" }), "poster"],
  ],
};

export default function Browse({ kind, onSelect }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const sections = CONFIG[kind];
    Promise.allSettled(sections.map(([, fetcher]) => fetcher())).then((res) => {
      const failed = res.find((r) => r.status === "rejected");
      if (res.every((r) => r.status === "rejected")) {
        setError(failed.reason.message);
        return;
      }
      setRows(
        sections.map(([title, , variant], i) => ({
          title,
          variant,
          items: res[i].status === "fulfilled" ? res[i].value.results : [],
        }))
      );
    });
  }, [kind]);

  if (!rows) return <div className="page-pad"><Status loading error={error} /></div>;

  const hero = rows.flatMap((r) => r.items).filter((i) => i.backdrop_path);
  const unique = [...new Map(hero.map((i) => [i.id, i])).values()].slice(0, 5);

  return (
    <>
      <HeroBanner items={unique} onSelect={onSelect} />
      <div className="rows">
        {rows.map((r) => (
          <Row key={r.title} title={r.title} items={r.variant === "top10" ? r.items.slice(0, 10) : r.items} variant={r.variant} onSelect={onSelect} />
        ))}
      </div>
    </>
  );
}
