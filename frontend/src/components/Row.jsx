import { useRef } from "react";
import { img } from "../api.js";

/**
 * 가로 스크롤 콘텐츠 열.
 * variant: "poster"(기본, 세로 포스터) | "top10"(순위 숫자) | "wide"(가로 썸네일)
 */
export default function Row({ title, items, onSelect, variant = "poster" }) {
  const ref = useRef(null);
  if (!items?.length) return null;

  const scroll = (dir) => {
    const el = ref.current;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <section className={`row row--${variant}`}>
      <h3 className="row__title">{title}</h3>
      <div className="row__wrap">
        <button className="row__arrow row__arrow--prev" onClick={() => scroll(-1)} aria-label="이전">&#8249;</button>
        <ul className="row__list" ref={ref}>
          {items.map((it, i) => (
            <li key={`${it.media_type}-${it.id}`} className="card" onClick={() => onSelect(it)}>
              {variant === "top10" && <span className="card__rank">{i + 1}</span>}
              <div className="card__thumb">
                <img
                  loading="lazy"
                  src={variant === "wide" ? img(it.backdrop_path || it.poster_path, "w500") : img(it.poster_path)}
                  alt={it.title}
                />
                {it.vote_average >= 8 && <span className="card__tag">HOT</span>}
              </div>
              {variant !== "top10" && <p className="card__name">{it.title}</p>}
            </li>
          ))}
        </ul>
        <button className="row__arrow row__arrow--next" onClick={() => scroll(1)} aria-label="다음">&#8250;</button>
      </div>
    </section>
  );
}
