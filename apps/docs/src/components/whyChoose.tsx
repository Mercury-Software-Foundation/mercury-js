import whyChooseImage from "../assets/whyChooseImage.png";
import SpeedIcon from "../assets/speedIcon.png";
import lock from "../assets/lock.png";
import Scalability from "../assets/scalability.png"
import Footer from "./Footer";

const data = [
  {
    title: "Speed",
    content:
      "Launch APIs faster, reduce manual coding, and focus on what matters—building features.",
    imageSrc: SpeedIcon,
  },
  {
    title: "Security",
    content:"Implement detailed access control with ease, protecting your data and ensuring compliance.",
    imageSrc: lock,
  }, {
    title: "Scalability",
    content:"Scale your backend seamlessly as your project grows, with Mercury.js's flexible architecture.",
    imageSrc: Scalability,
  },
];
function WhyChoose() {
  return (
    <div className="bg-[#003366] rounded-t-[50px]">

    <div className="min-h-screen flex flex-col xl:gap-36 lg:gap-14 gap-8 relative xl:py-14 md:py-16 py-8 xl:pl-[100px]  pl-[25px] ">
      <h1 className="xl:text-[85px] lg:text-[70px] md:text-[55px] text-[44px] font-bold font-Manrope-ExtraBold tracking-tighter text-white xl:leading-[90px] leading-[50px] md:pl-[38px] ">
        Why Choose <span className="text-[#0071E3]">Mercury.js</span>?
      </h1>
      <div className="grid xl:grid-cols-12 gap-5  flex-grow">
        <div className="xl:col-span-4 text-[white] h-[100%] xl:order-1 order-2 md:pl-[38px]">
          <div className="flex flex-col gap-10 h-[90%]">
            {data?.map((item, index: number) => (
              <div className="flex flex-col gap-5 " key={index}>
                <img
                  src={item?.imageSrc}
                  alt="icon"
                  className="w-[74px]  h-[59px] object-contain"
                />
                <div className="flex flex-col gap-2">
                <h3 className="xl:text-[35px] lg:text-[40px] md:text-[35px] text-[30px] font-bold font-Manrope-Bold tracking-tight text-[#B0D3F6]">
                  {item?.title}
                </h3>
                <p className="xl:text-[20px] lg:text-[22px]  md:text-[18px] text-[16px] font-Manrope-Medium tracking-tight leading-[28px] xl:leading-[30px] md:leading-[26px] xl:w-[100%] md:w-[50%] w-[88%]">{item?.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="xl:col-span-8 xl:order-2 order-1 flex justify-end ">
          <img
            src={whyChooseImage}
            alt="Why Choose Image"
            className="xl:h-[100%] lg:w-[90%] xl:w-[100%] w-[100%] xl:object-contain"
          />
        </div>
      </div>
      
    </div>
    <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

export default WhyChoose;
