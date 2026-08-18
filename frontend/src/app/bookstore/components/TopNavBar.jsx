"use client"
import { useState } from "react"
import { FaSearch } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

export default function TopNavBar() {

    const [searchText, setSearchText] = useState("");

    return (
        <div className="top flex items-center gap-3 justify-between bg-(--background) px-5 py-3 w-full rounded-lg">
            <div className="left">
                <h2 className="text-2xl font-semibold">Welcome Back!</h2>
            </div>
            <div className="right flex gap-2 items-center justify-between px-3 py-1 mr-20 w-75 shadow-md bg-(--section-hover) rounded-xl">
                <FaSearch className="text-xl" />
                <input type="search"
                    className="text-sm px-2 py-1 w-full border-none outline-none"
                    placeholder="Search By Title and Enter" />
                {/* <RxCross2 className={`text-xl cursor-pointer ${searchText.length > 0 ? "opacity-100" : "opacity-0"}`} /> */}
            </div>
        </div>
    )
}