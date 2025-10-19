import { useState } from "react";
import Login from '../components/Login';
import Signup from '../components/Signup';
import Iconn from '../assets/Icon.svg';
import HomeBG from '../assets/HomeBG.png';
import Logo from '../assets/Logo.svg';

interface InfoCardProps {
  Iconn: string;
  title: string;
  description: string;
}

function InfoCard({ Iconn, title, description }: InfoCardProps) {
  return (
    <div className="flex flex-col justify-center items-center w-full sm:w-75 border border-[#2E4657] rounded-xl p-4 bg-[#0b1825]/50 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-2 sm:gap-3 w-full mb-2">
        <div className="flex justify-center items-center bg-[#EE6767] w-9 h-9 rounded-full hover:animate-spin cursor-pointer">
          <img src={Iconn} alt={title} className="w-5" />
        </div>
        <h1 className="text-white text-md font-bold">{title}</h1>
      </div>
      <p className="text-white text-sm text-center leading-snug">{description}</p>
    </div>
  );
}

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const openLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const openSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  return (
    <div
      className="flex flex-col gap-4 w-full min-h-screen bg-cover bg-center bg-fixed p-2 sm:p-4"
      style={{ backgroundImage: `url(${HomeBG})` }}
    >
      {/* Navbar */}
      <div className="flex justify-between items-center w-full rounded-md bg-[#06121D]/95 py-4 px-3 sm:px-10">
        <img src={Logo} alt="Logo" className="w-25 sm:w-40" />

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Render buttons directly */}
          <Login model={showLogin} setModel={setShowLogin} switchToSignup={openSignup} />
          <Signup model={showSignup} setModel={setShowSignup} switchToLogin={openLogin} />
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col justify-center w-full px-1 sm:px-10 lg:px-20 py-10">
        <div className="flex items-center gap-2 bg-[#192B3A] w-fit px-4 py-2 rounded-md mb-4">
          <div className="flex justify-center items-center bg-[#EE6767] w-8 h-8 rounded-full hover:animate-spin cursor-pointer">
            <img src={Iconn} alt="Icon" className="w-5 animate-spin" />
          </div>
          <p className="text-white text-sm font-semibold">Latest v1.1.1</p>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl text-white font-extrabold mb-5">
          ClipDrop
        </h1>

        <p className="text-white text-lg sm:text-2xl font-semibold mb-4 max-w-3xl">
          Turn Any Link into a Download Button — Instantly.
        </p>

        <p className="text-white text-sm sm:text-base md:text-lg max-w-4xl">
          Paste your favorite video, song, or reel link and ClipDrop will fetch it for you in seconds.
          No ads. No limits. Just fast, secure downloads from YouTube, TikTok, Instagram, and more.
        </p>
      </div>

      {/* Info Section */}
      <div className="flex flex-wrap justify-center items-center bg-[#000000da] w-full gap-5 py-4 px-4">
        <InfoCard Iconn={Iconn} title="Paste your link" description="Drop your YouTube, TikTok, or Instagram link into the box." />
        <InfoCard Iconn={Iconn} title="ClipDrop fetches the media" description="We instantly detect the source and prepare your video or audio for download." />
        <InfoCard Iconn={Iconn} title="Download instantly" description="Choose your desired quality and download instantly—no ads, no limits." />
        <InfoCard Iconn={Iconn} title="Enjoy and share" description="Your downloaded content is ready to use or share across any platform." />
      </div>
    </div>
  );
}
