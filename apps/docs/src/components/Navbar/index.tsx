import { useState } from 'react';
import union from '../../assets/Union.png';
import onbar from '../../assets/Dark Toggle.png';
import offbar from '../../assets/Property 1=Dark.png';
import { AiOutlineClose } from 'react-icons/ai'; // Import close icon
import { MdOutlineSort } from 'react-icons/md';


const Navbar = () => {
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar

  const toggleColor = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.body.classList.remove('bg-[#0071E3]');
      document.body.classList.add('bg-blue-500');
    } else {
      document.body.classList.remove('bg-blue-500');
      document.body.classList.add('bg-[#0071E3]');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar state
  };

  

  return (
    
    <div
      className={
        'bg-transparent bg-opacity-45 flex flex-row w-full justify-between items-center p-5 md:px-16 px-5'
      }
    >
      <div className="w-full h-full">
        <img className="w-[50px] h-[30px]" src={union} alt="Union Logo" />
      </div>
      <div className="items-center text-white gap-4 justify-start md:flex hidden">
        <a
          href="/docs/intro"
          style={{
            textDecoration: 'none',
          }}
          className="hover:bg-[linear-gradient(180deg,#0071E3_0%,#005AB6_100%)] text-white hover:text-white rounded-full px-5 py-2.5 flex items-center justify-start gap-2 text-lg transition-all duration-300 ease-in-out"
        >
          <i className="fa-solid fa-file text-white"></i> Docs
        </a>
        <a
          href="https://github.com/Mercury-Software-Foundation"
          style={{
            textDecoration: 'none',
          }}
          target="_blank"
          className="hover:bg-[linear-gradient(180deg,#0071E3_0%,#005AB6_100%)] text-white hover:text-white rounded-full px-5 py-2.5 flex items-center justify-start gap-2 text-lg transition duration-300"
        >
          <i className="fa-brands fa-github text-white"></i> GitHub
        </a>
        <img
          onClick={toggleColor}
          src={isDark ? offbar : onbar}
          alt="Toggle Icon"
          style={{ width: '45px', height: '25px' }} // Adjust icon size as needed
        />
        {/* <button
          onClick={toggleColor}
          className="rounded-2xl bg-[#0071E3A6] flex items-center justify-center min-w-11 min-h-6 transition delay-300 ease-in-out"
        >
          
        </button> */}
      </div>
      <button
        onClick={toggleSidebar}
        className="md:hidden rotate-180 text-white p-0 bg-transparent border-none outline-none"
      >
        <MdOutlineSort className="text-4xl transform scale-[130%]" />
      </button>



      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-start w-full">
          <div className="bg-[#0071E3] h-full p-5 w-11/12">
            <div className="flex justify-between px-3">
              <img className="w-[50px] h-[30px]" src={union} alt="Union Logo" />
              <button
                onClick={toggleSidebar}
                className="flex justify-end p-0 bg-transparent border-none outline-none"
              >
                <AiOutlineClose className="text-4xl transform scale-[110%] text-white" />
              </button>

            </div>
            <nav className="flex flex-col gap-4 mt-10">
              <img
                onClick={toggleColor}
                src={isDark ? offbar : onbar}
                alt="Toggle Icon"
                className="h-[40px] flex items-start justify-start w-[20%] ml-5 cursor-pointer"
              />


              {/* Documentation Link */}
              <a
                href="/docs/intro"
                style={{
                  textDecoration: 'none',
                }}
                className="hover:bg-[linear-gradient(180deg,#0071E3_0%,#005AB6_100%)] w-fit text-white rounded-full px-5 py-2.5 flex items-center justify-start gap-2 text-2xl transition-all duration-300 ease-in-out"
              >
                <i className="fa-solid fa-file"></i> Docs
              </a>

              {/* GitHub Link */}
              <a
                href="https://github.com/Mercury-Software-Foundation"
                style={{
                  textDecoration: 'none',
                }}
                target="_blank"
                rel="noopener noreferrer" // Added for security reasons
                className="hover:bg-[linear-gradient(180deg,#0071E3_0%,#005AB6_100%)] w-fit text-white rounded-full px-5 py-2.5 flex items-center justify-start gap-2 text-2xl transition duration-300"
              >
                <i className="fa-brands fa-github"></i> GitHub
              </a>
            </nav>

          </div>
        </div>
      )}
    </div>
  );
};


export default Navbar;
