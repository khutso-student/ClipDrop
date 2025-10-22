// src/components/MainDash.tsx
import Dashboard from "../assets/Dashboard.png";
import { useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createLinkAPI, getLinksAPI, LinkResponse } from "../services/LinkAPI";

import Logo from "../assets/Logo.svg";
import Icon from "../assets/Icon.svg";
import { GrCloudDownload } from "react-icons/gr";
import { FaRegUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { MdHighQuality } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function MainDash() {
  const navigate = useNavigate();
  const [model, setModel] = useState(false);
  const [link, setLink] = useState("");
  const [videos, setVideos] = useState<LinkResponse[]>([]);
  const [fetchedVideos, setFetchedVideos] = useState<LinkResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({}); 

  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000"; //download video button//

  const auth = useContext(AuthContext);
  if (!auth) throw new Error("MainDash must be used within an AuthProvider");
  const { user, logout, loading: authLoading } = auth;

  // ✅ Unified loading + redirect check
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center w-full h-screen text-white">
        Loading user info...
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const fetchAllLinks = useCallback(async (): Promise<LinkResponse[]> => {
    try {
      const allLinks = await getLinksAPI();
      const updatedLinks = allLinks.map((link) => ({
        ...link,
        selectedQuality: link.selectedQuality || link.qualities?.[0] || "best",
      }));
      setVideos(updatedLinks);
      return updatedLinks;
    } catch (err) {
      console.error("Failed to fetch links:", err);
      return [];
    }
  }, []);

  // ✅ Throttled interval for progress updates
  useEffect(() => {
    const interval = setInterval(async () => {
      const hasPending = fetchedVideos.some((v) => v.status === "pending");
      if (hasPending) {
        const allLinks = await fetchAllLinks();
        const updatedFetched = fetchedVideos.map(
          (v) => allLinks.find((link) => link._id === v._id) || v
        );
        setFetchedVideos(updatedFetched);

        setProgressMap((prev) => {
          const newProgress: Record<string, number> = { ...prev };
          updatedFetched.forEach((v) => {
            if (v.status === "pending") newProgress[v._id] = Math.min((prev[v._id] || 0) + 5, 99);
            else newProgress[v._id] = 100;
          });
          return newProgress;
        });
      }
    }, 1000); // 1 second for production
    return () => clearInterval(interval);
  }, [fetchedVideos, fetchAllLinks]);

  const handleFetchVideos = async () => {
    if (!link.trim()) return alert("Please paste a valid video link!");
    try {
      setLoading(true);
      await createLinkAPI({ originalUrl: link });
      const allLinks = await fetchAllLinks();
      const newVideo = allLinks.find((v) => v.originalUrl === link);
      if (newVideo) {
        setFetchedVideos([newVideo]);
        setProgressMap((prev) => ({ ...prev, [newVideo._id]: 0 }));
      }
      setLink("");
    } catch (error: any) {
      console.error("Error fetching video:", error);
      alert(error.message || "Failed to fetch video");
    } finally {
      setLoading(false);
    }
  };

  const handleQualityChange = (id: string, quality: string) => {
    setFetchedVideos((prev) =>
      prev.map((v) => (v._id === id ? { ...v, selectedQuality: quality } : v))
    );
  };

  return (
    <div
      className="flex flex-col w-full min-h-screen bg-cover bg-center bg-fixed p-1 sm:p-4"
      style={{ backgroundImage: `url(${Dashboard})` }}
    >
      {/* Navbar */}
      <div className="relative flex justify-between items-center w-full h-14  backdrop-blur-md p-4 rounded-lg">
        <a href="#">
          <img src={Logo} alt="Logo" className="w-30 sm:w-40" />
        </a>
        <div className="relative">
          <button
            onClick={() => setModel(!model)}
            className="flex justify-center items-center text-white hover:text-[#EE6767] bg-[#000A14] hover:bg-[#001D33] w-11 h-11 rounded-full border-2 border-[#2E4657] hover:border-[#EE6767] cursor-pointer duration-300"
          >
            <FaRegUserCircle className="text-xl" />
          </button>

          <AnimatePresence>
            {model && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="absolute right-0 mt-3 w-64 bg-[#000A14]/99 border border-[#2E4657] rounded-2xl shadow-2xl p-4 text-white backdrop-blur-md z-50"
              >
                <div className="flex flex-col items-center gap-2 border-b border-[#2E4657] pb-3">
                  <FaRegUserCircle className="text-4xl text-[#EE6767]" />
                  <p className="text-base font-semibold">{user?.name || "Guest User"}</p>
                  <p className="text-xs text-gray-400">{user?.email || "No email available"}</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full mt-4 py-2 text-sm font-semibold bg-gradient-to-r from-[#001D33] to-[#000B15] border border-[#2E4657] hover:border-[#EE6767] hover:text-[#EE6767] rounded-lg duration-300"
                >
                  <FiLogOut className="text-lg" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Header */}
      <div className="text-center my-6">
        <h1 className="text-white text-5xl font-bold mb-4 sm:mb-2">ClipDrop</h1>
        <p className="text-white text-lg">
          Hello, <span className="font-bold">{user?.name || "Guest User"}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="flex  sm:flex-row justify-center gap-2 sm:gap-5 items-center w-[90%] mx-auto mb-4">
        <div className="flex items-center gap-3 bg-[#192B3A] w-fit px-2 sm:px-4 py-2 rounded-md shadow-lg">
          <div className="flex justify-center items-center bg-[#EE6767] w-8 sm:w-10 h-8 sm:h-10 rounded-full hover:animate-spin cursor-pointer">
            <img src={Icon} alt="Icon" className="w-4 sm:w-6" />
          </div>
          <p className="text-white text-xs sm:text-sm font-semibold">Latest v1.1.1</p>
        </div>

        <div className="flex items-center text-xs sm:text-md gap-3 bg-[#ffffff2f] text-white p-2 sm:p-3 h-12 rounded-md shadow-lg">
          <GrCloudDownload />
          <p>Download History: <span className="font-semibold">{videos.length}</span></p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row justify-center gap-6 w-full px-4">
        {/* Left Panel */}
        <div className="flex-1 flex flex-col gap-5 bg-[#ffffff2a] p-3 sm:p-5 rounded-2xl shadow-lg backdrop-blur-md">
          {/* Input */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <input
              type="text"
              placeholder="Paste link here..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="flex-1 p-3 text-white bg-[#000914ec] border border-[#2E4657] rounded-lg focus:outline-none"
            />
            <button
              onClick={handleFetchVideos}
              disabled={loading}
              className="bg-gradient-to-r from-[#EE6767] to-[#E84949] text-white text-sm p-3 w-full sm:w-40 rounded-lg hover:opacity-70 transition duration-300 cursor-pointer"
            >
              {loading ? "Fetching..." : "Get Download"}
            </button>
          </div>

          {/* Fetched Videos */}
          <AnimatePresence>
            {fetchedVideos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-5 mt-2"
              >
                {fetchedVideos.map((video) => (
                  <motion.div
                    key={video._id}
                    whileHover={{ scale: 1.03 }}
                    className="flex flex-col items-center bg-[#000A14]/80 w-full border border-[#2E4657] rounded-2xl p-4 shadow-lg backdrop-blur-md"
                  >
                    <img
                      src={video.thumbnail || `https://picsum.photos/seed/${video._id}/300/200`}
                      alt={video.title || video.originalUrl}
                      className="rounded-lg mb-3 w-full h-40 object-cover"
                    />
                    <h3 className="text-xs text-white font-semibold mb-1 w-full truncate break-words">
                      {video.title || video.originalUrl}
                    </h3>
                    <p
                      className={`text-sm font-medium mb-2 ${
                        video.status === "ready" ? "text-green-400" : "text-yellow-400"
                      }`}
                    >
                      Status: {video.status === "ready" ? "Ready" : "Pending"}
                    </p>

                    {video.status === "pending" && (
                      <div className="flex flex-col items-center w-full mb-3">
                        <AiOutlineLoading3Quarters className="animate-spin text-[#EE6767] text-xl mb-1" />
                        <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-2 bg-[#EE6767] text-white transition-all duration-500"
                            style={{ width: `${progressMap[video._id] || 0}%` }}
                          />
                        </div>
                        <p className="text-xs mt-1 text-white">{progressMap[video._id] || 0}%</p>
                      </div>
                    )}

                    {video.status === "ready" && (
                      <div className="flex items-center gap-2 mb-3 w-full justify-center">
                        <MdHighQuality className="text-[#EE6767] text-xl" />
                        <select
                          className="bg-[#001E34] text-white px-3 py-1 rounded-md border border-[#2E4657] focus:outline-none cursor-pointer"
                          value={video.selectedQuality}
                          onChange={(e) => handleQualityChange(video._id, e.target.value)}
                        >
                          {video.qualities?.map((q, idx) => (
                            <option key={`${q}-${idx}`} value={q}>
                              {q}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (!video.downloadUrl) return;
                        const url = `${apiBaseUrl}${video.downloadUrl}`;
                        window.open(url, "_blank");
                      }}
                      disabled={video.status !== "ready"}
                      className={`flex items-center text-white gap-2 px-5 py-2 rounded-lg text-sm font-semibold w-full justify-center ${
                        video.status === "ready"
                          ? "bg-gradient-to-r from-[#EE6767] to-[#E84949] hover:opacity-90"
                          : "bg-gray-700 cursor-not-allowed"
                      } transition-all duration-300`}
                    >
                      <GrCloudDownload className="text-lg" />
                      {video.status === "ready" ? "Download" : `${progressMap[video._id] || 0}%`}
                  </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-[#ffffff21] p-3 rounded-2xl shadow-lg backdrop-blur-md h-full flex flex-col">
          <h2 className="text-md font-bold mb-4 text-[#fff]">Download History</h2>
          <div className="flex-1 overflow-y-auto">
            {videos.length === 0 && (
              <p className="text-gray-500 text-center mt-10">No downloads yet...</p>
            )}
            {videos.map((video) => (
              <div
                key={video._id}
                className="flex items-center justify-between gap-3 bg-[#001E34]/50 rounded-lg p-3 mb-3 text-white shadow-md hover:scale-105 transform transition"
              >
                <p className="text-xs truncate">{video.title || video.originalUrl}</p>
                <span
                  className={`text-xs font-semibold ${
                    video.status === "ready" ? "text-green-400" : "text-yellow-400"
                  }`}
                >
                  {video.status === "ready" ? "Ready" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
