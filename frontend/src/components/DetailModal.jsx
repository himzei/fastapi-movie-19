import { useEffect, useState } from "react";
import { api, img } from "../api.js";

export default function DetailModal({ item, onClose, onSelect }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setData(null);
    setError("");
    setPlaying(false);
    api.detail(item.media_type, item.id).then(setData).catch((e) => setError(e.message));
  }, [item.media_type, item.id]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const d = data || item;
  const year = d.release_date?.slice(0, 4);

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__box" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="닫기">&#10005;</button>

        <div className="modal__visual">
          {playing && data?.trailer_key ? (
            <iframe
              src={`https://www.youtube.com/embed/${data.trailer_key}?autoplay=1`}
              title="trailer"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <>
              <img src={img(d.backdrop_path || d.poster_path, "w1280")} alt="" />
              <div className="modal__shade" />
              <div className="modal__head">
                <h2>{d.title}</h2>
                {data?.tagline && <p className="modal__tagline">{data.tagline}</p>}
                <div className="modal__actions">
                  {data?.trailer_key ? (
                    <button className="btn btn--primary" onClick={() => setPlaying(true)}>
                      <svg viewBox="0 0 24 24" width="18" height="18"><path d="M7 4l13 8-13 8z" fill="currentColor" /></svg>
                      예고편 재생
                    </button>
                  ) : (
                    data && <span className="muted">예고편이 없습니다</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal__body">
          {error && <p className="error">{error}</p>}
          <div className="meta">
            {year && <span>{year}</span>}
            <span className="meta__score">&#9733; {d.vote_average}</span>
            {data?.runtime ? <span>{data.runtime}분</span> : null}
            {data?.number_of_seasons ? <span>시즌 {data.number_of_seasons}개</span> : null}
            {data?.number_of_episodes ? <span>{data.number_of_episodes}화</span> : null}
            {data?.genres?.map((g) => <span key={g} className="chip">{g}</span>)}
          </div>
          <p className="overview">{d.overview || "줄거리 정보가 없습니다."}</p>

          {data?.directors?.length > 0 && (
            <p className="credit"><b>{d.media_type === "tv" ? "크리에이터" : "감독"}</b> {data.directors.join(", ")}</p>
          )}

          {data?.cast?.length > 0 && (
            <>
              <h4>출연</h4>
              <ul className="cast">
                {data.cast.map((c) => (
                  <li key={c.id}>
                    <div className="cast__img">
                      {c.profile_path ? <img src={img(c.profile_path, "w185")} alt={c.name} /> : <span>{c.name[0]}</span>}
                    </div>
                    <p>{c.name}</p>
                    <small>{c.character}</small>
                  </li>
                ))}
              </ul>
            </>
          )}

          {data?.similar?.length > 0 && (
            <>
              <h4>비슷한 콘텐츠</h4>
              <ul className="similar">
                {data.similar.map((s) => (
                  <li key={s.id} onClick={() => onSelect(s)}>
                    <img src={img(s.poster_path)} alt={s.title} loading="lazy" />
                    <p>{s.title}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
          {!data && !error && <div className="spinner" />}
        </div>
      </div>
    </div>
  );
}
