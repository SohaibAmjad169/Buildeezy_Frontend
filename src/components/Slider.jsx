import { Swiper } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { colors } from "../styles/theme";

function Slider({ children }) {
  return (
    <Swiper
      modules={[Navigation, Autoplay]}
      navigation={true}
      autoplay={{
        delay: 10000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      spaceBetween={20}
      slidesPerView="auto"
      centeredSlides={false}
      loop={true}
      breakpoints={{
        320: {
          spaceBetween: 20,
          slidesPerView: 1,
          centeredSlides: true,
        },
        600: {
          spaceBetween: 20,
          slidesPerView: 2,
        },
        1200: {
          spaceBetween: 20,
          slidesPerView: 3,
        },
        1440: {
          spaceBetween: 20,
          slidesPerView: 4,
        },
        1905: {
          spaceBetween: 20,
          slidesPerView: 5,
        },
      }}
      style={{
        width: "auto",
        height: "auto",
        padding: "8px 0",
        "--swiper-navigation-color": colors.grey400,
        "--swiper-navigation-size": "24px",
      }}
    >
      {children}
    </Swiper>
  );
}

export default Slider;
