const IMG = "https://image.tmdb.org/t/p";

export const img = (path, size = "w342") => (path ? `${IMG}/${size}${path}` : null);

async function get(url) {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `요청 실패 (${res.status})`);
  return data;
}

export const api = {
  home: () => get("/api/home"),
  list: (type, category, page = 1) => get(`/api/list/${type}/${category}?page=${page}`),
  discover: (type, { genre, lang, page = 1 } = {}) => {
    const p = new URLSearchParams({ page });
    if (genre) p.set("genre", genre);
    if (lang) p.set("lang", lang);
    return get(`/api/discover/${type}?${p}`);
  },
  genres: (type) => get(`/api/genres/${type}`),
  detail: (type, id) => get(`/api/detail/${type}/${id}`),
  search: (q, page = 1) => get(`/api/search?q=${encodeURIComponent(q)}&page=${page}`),
};
