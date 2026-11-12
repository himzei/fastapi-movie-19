import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, img } from "../api.js";
import Status from "../components/Status.jsx";

export default function Search({ onSelect }) {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!q) return;
    setResults(null);
    setError("");
    api.search(q).then((d) => setResults(d.results)).catch((e) => setError(e.message));
  }, [q]);

  return (
    <div className="page-pad search">
      <h2 className="search__title">
        <b>'{q}'</b> 검색 결과 {results && <span>{results.length}</span>}
      </h2>
      {!results && <Status loading error={error} />}
      {results?.length === 0 && <p className="muted">검색 결과가 없습니다.</p>}
      <ul className="grid">
        {results?.map((it) => (
          <li key={`${it.media_type}-${it.id}`} className="card" onClick={() => onSelect(it)}>
            <div className="card__thumb">
              <img src={img(it.poster_path)} alt={it.title} loading="lazy" />
            </div>
            <p className="card__name">{it.title}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
