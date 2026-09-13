import { HashTag } from "@/app/components/utils/FunctionalUtils";
import { FaRegHeart } from "react-icons/fa";
import { FiBookOpen, FiShield } from "react-icons/fi";
import { GoNote } from "react-icons/go";
import { MdLocalOffer } from "react-icons/md";

export function UserContent() {
    return (
        <div className="left bg-[linear-gradient(135deg,#0f172a,#2563eb)] text-white rounded-l-2xl lg:rounded-tr-none rounded-b-none lg:rounded-l-4xl
                 p-5 lg:p-8 flex flex-col gap-5 justify-around w-fit lg:w-full">
            <div className="flex gap-2 px-3 py-1 items-center w-fit font-semibold ">
                <div className="icon border-2 border-white/20 bg-white/10 items-center flex justify-center p-2 rounded-2xl">
                    <FiBookOpen className="text-2xl" />
                </div>
                <div className="content flex flex-col">
                    <p className="text-lg font-semibold tracking-[0.2em] text-white/85 uppercase">BookStore</p>
                    <p className="text-sm text-white/70">READ . LEARN . GROW</p>
                </div>
            </div>
            <div className="content flex flex-col gap-4">
                <p className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                    Secure portal
                </p>
                <div className="maincontent flex flex-col gap-4 leading-0.5">
                    <h1 className="lg:text-4xl text-2xl font-semibold leading-tight">A good book has no ending</h1>
                    <p className="lg:text-md text-base leading-8">
                        Discover premium editions, curated collections, and fast checkout designed for modern readers and enterprise teams.
                    </p>
                </div>
                <div className="btns flex lg:flex-row flex-col flex-wrap gap-6">
                    <HashTag icon={<MdLocalOffer />} text="Exclusive Offers" />
                    <HashTag icon={<GoNote />} text="Track your Orders" />
                    <HashTag icon={<FaRegHeart />} text="Make your own wishlist" />
                </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-white/15 p-2">
                        <FiShield className="text-lg" />
                    </div>
                    <div>
                        <p className="font-semibold">Protected account access</p>
                        <p className="mt-1 text-sm text-slate-200">
                            Your login is secured with a modern, streamlined experience built for everyday book purchasing.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}