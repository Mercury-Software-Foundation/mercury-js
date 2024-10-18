import logo from '../../assets/Logo mercury.png';
import union from '../../assets/Logo mercury.png';

import { useEffect, useRef } from 'react';

const Footer = () => {
  const mercuryTextRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const windowWidth = window.innerWidth;
  
      const angle = Math.round((event.pageX / windowWidth) * 360);
  
      const colorStop1Percentage = 0;
      const colorStop2Percentage = 28; 
      const colorStop3Percentage = 54; 
      const colorStop4Percentage = 80; 
      const colorStop5Percentage = 100; 
  
      const mercuryText = document.querySelector(
        ".mercury-gra"
      ) as HTMLElement;
  
      if (mercuryText) {
        mercuryText.style.background = `conic-gradient(
          from ${angle}deg, 
          #FFFFFF ${colorStop1Percentage}%, 
          #CCE5FF ${colorStop2Percentage}%, 
          #0071E3 ${colorStop3Percentage}%, 
          #D9EAFB ${colorStop4Percentage}%, 
          #FFFFFF ${colorStop5Percentage}%
        )`;
        mercuryText.style.backgroundClip = "text";
        mercuryText.style.webkitBackgroundClip = "text";
        mercuryText.style.color = "transparent";
      }
    };
  
    window.addEventListener("mousemove", handleMouseMove);
  
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    
    <div
      className="  w-full flex flex-col bg-[#00284F] lg:p-10 p-2 rounded-t-[50px] text-center lg:px-20 px-8"
      id="footer"
    >
      <div className="lg:grid grid-cols-12 flex flex-col justify-start items-start w-full">
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
        />
        <div className="col-span-5">
          <div className="flex flex-row mt-12 gap-2 justify-start items-center">
            
            <img
              src={logo}
              alt="Mercury Logo"
              className="lg:w-[111px] lg:h-[69px] w-[60px] h-[37px]"
            />
            <div className="flex flex-col justify-start items-start gap-0">
              <h1
                ref={mercuryTextRef}
                className="lg:text-[45px] text-[30px]  text-white font-Manrope-ExtraBold tracking-tight mercury-gra lg:leading-[50px] leading-[30px]"
              >
                Mercury
              </h1>
              <h2 className="text-[#0071E3] font-Manrope-Bold tracking-tight lg:text-2xl text-lg ml-0.5 lg:m-0 lg:-mt-2 -mt-1">
                Software Foundation
              </h2>
            </div>
          </div>
          <div className="mt-8 text-[#0071E3] ">
            <h1 className='font-Manrope-Light tracking-normal text-start xl:text-[20px] lg:text-[18px] md:text-[16px] text-[14px] xl:leading-[30px] lg:leading-[28px] leading-[20px]'>
              Scale your backend seamlessly as your project grows, with
              Mercury.js's flexible architecture.
            </h1>
          </div>
        </div>

        <div className="col-span-3">
          <div className="flex flex-row lg:justify-end">
            <div className="mt-12 text-white flex flex-col  items-start transition-all delay-300 ease-in-out  ">
              <a
                href="/mercury-js/docs/intro"
                className="hover:bg-gradient-to-t from-[#005AB6] to-[#0071E3] rounded-full xl:px-5 py-2.5 flex items-center justify-start gap-2 lg:text-sm text-xl hover:text-white transition-all duration-300 ease-in-out hover:no-underline "
              >
                <i className="fa-solid fa-file text-[#0071E3] transition-colors duration-300 ease-in-out"></i>
                Documentation
              </a>
              <a
                href="https://github.com/Mercury-Software-Foundation"
                className="hover:bg-gradient-to-t from-[#005AB6] to-[#0071E3] rounded-full xl:px-5 py-2.5 flex items-center justify-start gap-2 lg:text-sm text-xl hover:text-white transition-all duration-300 ease-in-out hover:no-underline"
              >
                <i className="fa-brands fa-github text-[#0071E3]"></i> GitHub
              </a>
              {/* <a href="#" className="hover:bg-gradient-to-t from-[#005AB6] to-[#0071E3] rounded-full px-5 py-2.5 flex items-center justify-start gap-2 text-sm transition-all duration-300 ease-in-out">
                <i className="fa-solid fa-phone text-[#0071E3]"></i> Contact Us
              </a> */}
            </div>

            {/* <div className="mt-12 text-white flex flex-col  ml-20 items-start">
              <a href="#" className="hover:bg-gradient-to-t from-[#005AB6] to-[#0071E3] rounded-full px-5 py-2.5 flex items-center justify-start gap-2 text-sm transition-all duration-300 ease-in-out">
                <i className="fa-brands fa-instagram text-[#0071E3]"></i> Instagram
              </a>
              <a href="#" className="hover:bg-gradient-to-t from-[#005AB6] to-[#0071E3] rounded-full px-5 py-2.5 flex items-center justify-start gap-2 text-sm transition-all duration-300 ease-in-out">
                <i className="fa-brands fa-twitter text-[#0071E3]"></i> Twitter
              </a>
              <a href="#" className="hover:bg-gradient-to-t from-[#005AB6] to-[#0071E3] rounded-full px-5 py-2.5 flex items-center justify-start gap-2 text-sm transition-all duration-400 ease-in-out0">
                <i className="fa-brands fa-youtube text-[#0071E3]"></i> Youtube
              </a>
            </div> */}
          </div>
        </div>

        {/* <div className="col-span-4 flex justify-start items-start flex-col ml-28">
          <h1 className=" mt-12 text-white">
            Subscribe for latest Updates & News!
          </h1>
          <div className=" mt-2">
            <div className="relative w-full">
              <input
                className="border-2 rounded-xl w-full border-[#0071E3] placeholder:text-[#0071E3] py-2 bg-[#00284F] pl-3 text-white transition duration-300 ease-in-out focus:border-[#0071E3] hover:border-[#0071E3]"
                placeholder="Enter your Email"
                type="email"
              />

              <button
                className="absolute -right-1/3 border-2 top-1/2 transform -translate-y-1/2 px-5 py-2 rounded rounded-r-xl text-white border-[#0071E3] bg-[#0071E3]"
                type="submit"
              >
                Submit
              </button>
            </div>
          </div>
        </div> */}
      </div>

      <div className="flex lg:flex-row gap-5 flex-col justify-between xl:text-[18px]  text-[14px] font-Manrope-Medium tracking-normal text-[#0055AA] bg-[#002040] xl:rounded-full rounded-[18px] px-5 py-4  mt-5 w-[100%]">
        <p className="text-start">
          Copyright © 2024 Mercury Software Foundation by Vithi
        </p>
        <div className="flex flex-row gap-1">
          <div>
            <p>Built with </p>
          </div>
          <div className="flex gap-1">
            <p>Docusaurus</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
