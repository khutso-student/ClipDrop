import { useState } from "react"


import ClipDrop from '../assets/ClipDrop.svg';

import { AiOutlineMail } from "react-icons/ai";
import { CiLock } from "react-icons/ci";

export default function Login() {

    const [model, setModel] = useState(false);

return(
    <div className="p-2">
        <button
            onClick={() => setModel(!model)}
            className="bg-gradient-to-r from-[#000B15] to-[#001D33] text-white text-sm hover:text-[#EE6767] px-4 sm:px-6 py-1.5 border border-[#2E4657] hover:border-[#EE6767] rounded-lg hover:opacity-90 transition duration-300 cursor-pointer"
            >
            Login
        </button>


            {model && (
                <div onClick={() => setModel(false)}
                className="fixed top-0 right-0 bg-[#000000a8] w-full sm:w-full h-full flex justify-center items-center z-30">
                    <div onClick={(e) => e.stopPropagation()}
                    className="flex justify-center items-center gap-4 bg-[#000] w-[90%] sm:w-160 h-110 border border-[#686868] rounded-md p-4">
                        <div className="hidden sm:flex justify-center items-center h-full w-70 ">
                            <img src={ClipDrop} alt="Login Logo" className="h-80" />
                        </div>

                        <div className="flex flex-col justify-center items-center h-full w-full sm:w-80 border-l-2 border-[#000] sm:border-[#2E4657]  rounded-md p-4">
                            <h1 className="text-white text-3xl font-bold mb-5">Login</h1>
                            <form className="w-full" >
                                <div className="w-full mb-2">
                                    <p className="text-white text-sm">Email</p>
                                </div>
                                <div className="flex gap-4 items-center text-[#8a8888] bg-[#0D0D0D] w-full p-2 border border-[#8a8888] rounded-md mb-4">
                                <AiOutlineMail />
                                <input type="Email"
                                placeholder="Enter Email"
                                className="w-full text-sm focus:outline-none" />
                                </div>

                                <div className="flex justify-between items-center w-full mb-2">
                                    <p className="text-white text-sm">Password</p>
                                    <p className="text-white text-sm hover:text-[#EE6767] cursor-pointer duration-300">
                                        Forgot Password?
                                    </p>
                                </div>
                                <div className="flex gap-4 items-center text-[#8a8888] bg-[#0D0D0D] w-full p-2 border border-[#8a8888] rounded-md mb-3">
                                <CiLock />
                                <input type="password"
                                placeholder="Enter Password"
                                className="w-full text-sm focus:outline-none" />
                                </div>
                                <button
                                className="bg-gradient-to-r from-[#000B15] to-[#001D33] text-white font-semibold hover:text-[#EE6767] w-full py-1.5 border border-[#2E4657] mb-3 rounded-md duration-300 cursor-pointer">
                                    Login
                                </button>
                                <div className="flex gap-2 justify-center items-center w-full text-white text-sm">
                                    <p>Don't have account? </p>
                                    <p className="font-semibold text-white hover:text-[#EE6767] cursor-pointer">Create</p>
                                </div>
                                <div className="flex justify-center items-center w-full text-[#686666] mt-8 text-sm">
                                    <p className="">
                                     &copy; {new Date().getFullYear()} ClipDrop. All rights reserved.
                                    </p>
                                </div>
                                
                            </form>
                        </div>
                    </div>
                </div>
            )}
    </div>
    )
}