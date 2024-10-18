import React, { useEffect, useState } from "react";
import "../App.css";
import { featuresData } from "../constants";
import WhyChoose from "./whyChoose";

interface FeatureProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
}

const Feature: React.FC<FeatureProps> = ({
  title,
  description,
  imageSrc,
  imageAlt,
  reverse = false,
}) => {
  return (
    <div
      className={`feature flex flex-col w-full ${
        reverse ? "md:flex-row-reverse" : "md:flex-row"
      } md:items-center items-start lg:mt-[110px] mt-[10px] flex-col-reverse xl:gap-2 lg:gap-5 gap-3`}
    >
      <div className="lg:w-[60%] md:w-[30%] flex flex-col lg:gap-5 gap-2">
        <h3 className="xl:text-[50px] md:text-[40px] text-[34px] xl:leading-[52.5px] font-Manrope-Bold tracking-tighter md:leading-[40px] text-[#0071E3] xl:w-[72%] lg:w-[60%]">
          {title}
        </h3>
        <p className="text-black lg:text-[25px] md:text-[16px] font-Manrope-Medium tracking-tight lg:leading-[32px] md:leading-[20px] text-[14px] leading-[17px]">
          {description}
        </p>
      </div>
      <div className="flex justify-center xl:p-0 lg:p-6">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="xl:w-full md:w-full w-[240px] xl:h-[300px] h-[240px] object-contain"
        />
      </div>
    </div>
  );
};

const FeaturesSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const steps = document.querySelectorAll(".img-step");
      let newActiveIndex = 0;

      steps.forEach((step, index) => {
        const rect = step.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.5) {
          newActiveIndex = index;
        }
      });

      setActiveIndex(newActiveIndex);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="bg-[#E6F1FC] rounded-t-[50px]">
      <div className="img-step-container lg:py-16 max-w-full lg:px-[100px] rounded-t-[50px] px-5 py-10 h-[300vh]">
        <div className="flex flex-col justify-center align-middle text-start xl:mb-12 md:mb-10">
          <h2 className="text-[#00284F] md:w-[95%] md:leading-[55px] lg:leading-[74px] xl:leading-[95.3px] xl:text-[85px] lg:text-[70px] md:text-[48px] text-[40px] leading-[41.34px] font-Manrope-ExtraBold tracking-tighter">
            <span className="text-[#0071E3]">Powerful Features</span> to <br className="lg:block hidden" /> Supercharge Your Development
          </h2>
        </div>

        {/* Features */}
        {featuresData.map((feature, index) => (
          <div
            key={index}
            className={`img-step transition-opacity duration-500 ${
              index < activeIndex ? "opacity-0" : "opacity-100"
            } sticky top-[calc(var(--nav-h)+30px)]`} 
          >
            <Feature
              title={feature.title}
              description={feature.description}
              imageSrc={feature.imageSrc}
              imageAlt={feature.imageAlt}
              reverse={feature.reverse}
            />
          </div>
        ))}
      </div>
      <div>
        <WhyChoose />
      </div>
    </div>
  );
};

export default FeaturesSection;
