export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__links">
        <span>고객센터</span><span>이용약관</span><b>개인정보처리방침</b><span>청소년 보호정책</span><span>회사 안내</span>
      </div>
      <p>이 사이트는 학습용 프로젝트이며 콘텐츠 정보는 TMDB API를 사용합니다.</p>
      <p className="tmdb">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      <p className="copy">© 2026 MOVIE19</p>
    </footer>
  );
}
