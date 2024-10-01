import { IoPlayCircleOutline } from "react-icons/io5";
import brain from "../assets/brain.png";
import { GoArrowUpRight } from "react-icons/go";
import { useEffect, useRef } from "react";
import Navbar from "./Navbar";
import FeaturesSection from "./FeatureSection";
import playCircle from "../assets/playcircle.png";
import playButton from "../assets/playbutton.png";
import { IoMdPlay } from "react-icons/io";
import gsap from "gsap";

const HeroBanner = () => {
  useEffect(() => {
    const playTutorial = document.querySelector(".play-tutorial");

    if (playTutorial) {
      const handleMouseEnter = () => {
        gsap.to(playTutorial, {
          scale: 1.2,
          duration: 0.3,
          ease: "bounce.out",
        });
      };

      const handleMouseLeave = () => {
        gsap.to(playTutorial, {
          scale: 1,
          duration: 0.3,
          ease: "bounce.out",
        });
      };

      playTutorial.addEventListener("mouseenter", handleMouseEnter);
      playTutorial.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        playTutorial.removeEventListener("mouseenter", handleMouseEnter);
        playTutorial.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const mouseXpercentage = Math.round((event.pageX / windowWidth) * 100);
      const mouseYpercentage = Math.round((event.pageY / windowHeight) * 100);

      const mercuryText = document.querySelector(
        ".mercury-gradient"
      ) as HTMLElement;
      if (mercuryText) {
        mercuryText.style.background = `radial-gradient(
                    at ${mouseXpercentage}% ${mouseYpercentage}%, 
                   #0071E3 0%,
                    #FFFFFF 100%
                )`;
        mercuryText.style.backgroundClip = "text";
        mercuryText.style.webkitBackgroundClip = "text";
        mercuryText.style.color = "transparent";
        // mercuryText.style.textShadow = "0px 12px 20px rgba(0, 0, 0, 0.5)";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const magnetic = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const magneticItem = magnetic.current;

      if (!magneticItem) return;

      const { height, width, left, top } = magneticItem.getBoundingClientRect();

      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);

      gsap.to(magneticItem, {
        x: x * 0.3, // Control the strength of the pull
        y: y * 0.3,
        duration: 0.6, // Smooth animation
        ease: "power3.out", // Smooth easing
      });
    };

    const handleMouseLeave = () => {
      gsap.to(magnetic.current, {
        x: 0,
        y: 0,
        duration: 0.8, // Smooth return to the center
        ease: "elastic.out(1, 0.3)",
      });
    };

    const magneticItem = magnetic.current;
    if (magneticItem) {
      magneticItem.addEventListener("mousemove", handleMouseMove);
      magneticItem.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (magneticItem) {
        magneticItem.removeEventListener("mousemove", handleMouseMove);
        magneticItem.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      className="h-screen w-full mx-auto relative z-0 bg-cover bg-center bg-[#0071E3]"
      style={{ backgroundImage: `url(${brain})` }}
    >
      <div className="absolute top-0 left-0 right-0 bottom-0">
        <Navbar />
      </div>
      <div className="bg-[#0071E3] w-full h-full z-10 bg-opacity-45 flex flex-col justify-center items-center text-white">
        <div className=" w-[50%] mx-auto ">
          <h1 className="text-[90px] mercury-gradient font-Manrope-ExtraBold bg-clip-text leading-[95px] tracking-tighter">
            Mercury -
          </h1>
          <h1 className="text-[85px] leading-[85px] tracking-tighter font-Manrope-ExtraBold">
            Develop at the speed of thought
          </h1>
          <p className="text-[20px] font-Manrope-Medium tracking-wide w-[68%] mt-4">
            Transform your ideas into robust backend services{" "}
            <span className="bg-[#0071e3]">in minutes, </span>
            not hours.
          </p>
        </div>

        {/* GET Started Button */}
        <div
          ref={magnetic}
          className="absolute bottom-[18%] right-[15%]"
          onClick={() => {
            window.open("/mercury-js/docs/intro");
          }}
        >
          <div className="relative group">
            <div className="w-52 h-52 bg-transparent flex justify-center items-center border-2 rounded-full group-hover:border-[#0066CC] border-transparent">
              <div className="w-40 h-40 flex items-center justify-center">
                <div className="bg-gradient-to-b from-white to-[#0071E3] rounded-full w-full h-full text-black flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 transform scale-100 group-hover:scale-110 group-hover:bg-gradient-to-b group-hover:from-[#005ab6] group-hover:to-[#005ab6] group-hover:text-white">
                  <GoArrowUpRight className="text-5xl" />
                  <p className="uppercase text-lg font-Manrope-SemiBold tracking-tight w-[80px] leading-[18px] break-words text-center">
                    GET Started
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Play Tutorial Section */}
        <div
          className="flex items-center gap-3 absolute bottom-10 left-16 text-5xl play-tutorial group"
          onClick={() => window.open("/mercury-js/docs/nextjs")}
        >
          <div className="relative inline-block">
            <img
              src={playCircle}
              alt="playCircle"
              className="w-[40px] group-hover:bg-white rounded-full transition-all duration-300 ease-in-out"
            />
            <img
              src={playButton}
              alt="playButton"
              className="absolute top-[20px] left-[22px] transform -translate-x-1/2 -translate-y-1/2 w-1/3 group-hover:hidden transition-all duration-300 ease-in-out"
            />
            <IoMdPlay className="absolute top-[20px] left-[22px] transform -translate-x-1/2 -translate-y-1/2 w-[20px] group-hover:block group-hover:text-[#0071E3] transition-all duration-300 ease-in-out" />
          </div>
          <div>
            <p className="font-Manrope-Medium tracking-normal   text-[16px]">
              Tutorial
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-r from-[#478be2] to-[#2e62db]">
        <FeaturesSection />
      </div>
    </div>
  );
};

export default HeroBanner;
