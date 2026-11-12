import { useEffect, useState } from "react";
import { api } from "../api.js";
import HeroBanner from "../components/HeroBanner.jsx";
import Row from "../components/Row.jsx";
import Status from "../components/Status.jsx";

export default function Home({ onSelect }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.home().then(setData).catch((e) => setError(e.message));
  }, []);

  if (!data) return <div className="page-pad"><Status loading error={error} /></div>;

  return (
    <>
      <HeroBanner items={data.hero} onSelect={onSelect} />
      <div className="rows">
        <Row title="오늘의 TOP 10" items={data.top10} variant="top10" onSelect={onSelect} />
        <Row title="지금 뜨는 콘텐츠" items={data.trending} onSelect={onSelect} />
        <Row title="인기 한국 드라마" items={data.korean_drama} onSelect={onSelect} />
        <Row title="극장 상영 중인 영화" items={data.now_playing} variant="wide" onSelect={onSelect} />
        <Row title="화제의 예능" items={data.variety} onSelect={onSelect} />
        <Row title="인기 영화" items={data.popular_movie} onSelect={onSelect} />
        <Row title="해외 인기 시리즈" items={data.popular_tv} onSelect={onSelect} />
        <Row title="애니메이션" items={data.anime} onSelect={onSelect} />
        <Row title="평점이 높은 명작 영화" items={data.top_rated} onSelect={onSelect} />
        <Row title="개봉 예정작" items={data.upcoming} variant="wide" onSelect={onSelect} />
      </div>
    </>
  );
}
