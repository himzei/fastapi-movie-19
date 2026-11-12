import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

const MENUS = [
  { to: "/drama", label: "드라마" },
  { to: "/variety", label: "예능" },
  { to: "/movie", label: "영화" },
  { to: "/anime", label: "애니" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    setSearchOpen(false);
  };

  return (
    <header className={`header ${scrolled ? "header--solid" : ""}`}>
      <div className="header__left">
        <Link to="/" className="logo">MOVIE<span>19</span></Link>
        <nav className="gnb">
          {MENUS.map((m) => (
            <NavLink key={m.to} to={m.to} className={({ isActive }) => (isActive ? "active" : "")}>
              {m.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="header__right">
        <button className="icon-btn" aria-label="검색" onClick={() => setSearchOpen((v) => !v)}>
          {searchOpen ? (
            <svg viewBox="0 0 24 24" width="26" height="26"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="26" height="26"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          )}
        </button>
        <div className="profile" aria-label="프로필" />
      </div>
      {searchOpen && (
        <div className="search-panel">
          <form onSubmit={submit}>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="제목, 인물명으로 검색해보세요."
            />
          </form>
        </div>
      )}
    </header>
  );
}
