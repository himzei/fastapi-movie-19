export default function Status({ loading, error }) {
  if (error)
    return (
      <div className="status">
        <p className="error">{error}</p>
        <p className="muted">backend/.env 의 TMDB 키와 백엔드 서버(포트 8000) 실행 여부를 확인하세요.</p>
      </div>
    );
  if (loading) return <div className="status"><div className="spinner" /></div>;
  return null;
}
