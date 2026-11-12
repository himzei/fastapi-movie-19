import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { img } from "../api.js";

/**
 * 메인 배너 캐러셀
 * - 가운데 슬라이드 + 양옆 슬라이드가 살짝 보이는 형태 (centeredSlides + slidesPerView: auto)
 * - 무한 루프, 자동 재생(마우스 올리면 일시정지), 우측 하단 점 페이지네이션
 * - 이전/다음 버튼과 점은 Swiper 인스턴스를 직접 호출해 제어
 */
export default function HeroBanner({ items, onSelect }) {
  const [swiper, setSwiper] = useState(null);
  const [active, setActive] = useState(0);

  if (!items.length) return <div className="hero hero--empty" />;

  const loop = items.length >= 3;
  const prev = () => {
    if (!swiper) return;
    if (loop || swiper.realIndex > 0) swiper.slidePrev();
    else swiper.slideTo(items.length - 1);
  };
  const next = () => {
    if (!swiper) return;
    if (loop || swiper.realIndex < items.length - 1) swiper.slideNext();
    else swiper.slideTo(0);
  };
  const goTo = (i) => swiper && (loop ? swiper.slideToLoop(i) : swiper.slideTo(i));

  return (
    <section className="hero">
      <Swiper
        modules={[Autoplay]}
        slidesPerView="auto"
        centeredSlides
        spaceBetween={12}
        loop={loop}
        speed={600}
        autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        onSwiper={setSwiper}
        onSlideChange={(s) => setActive(s.realIndex)}
        className="hero__swiper"
      >
        {items.map((it) => (
          <SwiperSlide key={`${it.media_type}-${it.id}`} className="hero__slide">
            <button className="hero__card" onClick={() => onSelect(it)} aria-label={`${it.title} 상세보기`}>
              <img src={img(it.backdrop_path, "w1280")} alt="" />
              <div className="hero__shade" />
              <div className="hero__content">
                <span className="hero__badge">
                  <i />
                  {it.media_type === "tv" ? "SERIES" : "MOVIE"}
                </span>
                <h2 className="hero__title">{it.title}</h2>
                <p className="hero__desc">{it.overview || "줄거리 정보가 없습니다."}</p>
              </div>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="hero__pager">
        {items.map((it, i) => (
          <button
            key={it.id}
            className={`hero__dot ${i === active ? "is-active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`${i + 1}번 배너`}
          />
        ))}
      </div>
      <button type="button" className="hero__nav hero__nav--prev" onClick={prev} aria-label="이전 배너">
        <svg viewBox="0 0 24 48" width="22" height="44"><path d="M20 4L4 24l16 20" /></svg>
      </button>
      <button type="button" className="hero__nav hero__nav--next" onClick={next} aria-label="다음 배너">
        <svg viewBox="0 0 24 48" width="22" height="44"><path d="M4 4l16 20L4 44" /></svg>
      </button>
    </section>
  );
}
