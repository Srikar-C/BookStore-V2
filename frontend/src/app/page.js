"use client"
import { NoiseTexture } from "@/components/ui/noise-texture";
import { cn } from "@/lib/utils"
import Link from "next/link";
import Snowfall from "react-snowfall";

export default function Home() {

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center bg-[#020617] overflow-hidden">
      {/* <Meteors number={80} className="text-(--color)" /> */}
      <Snowfall snowflakeCount={30} />
      <NoiseTexture className={cn(
        "absolute inset-0",
        "mask-[radial-gradient(420px_circle_at_center,white,transparent)] w-screen h-screen"
      )} />
      <div className="context flex flex-col gap-5">
        <span className="pointer-events-none bg-linear-to-b from-(--foreground) to-gray-300/80 bg-clip-text text-8xl font-semibold text-transparent">
          Bookstore
        </span>
        <div className={`btns flex gap-3 justify-around text-2xl font-semibold italic *:cursor-pointer`}>
          <Link href="/user/login" className="text-(--foreground) hover:text-(--background) bg-(--background) hover:bg-(--foreground) shadow-md shadow-(color:--shadow) px-5 py-3 rounded-2xl hover:scale-110 transition-transform">Login</Link>
          <Link href="/user/register" className="text-(--foreground) hover:text-(--background) bg-(--background) hover:bg-(--foreground) shadow-md shadow-(color:--shadow) px-5 py-3 rounded-2xl hover:scale-110 transition-transform">Register</Link>
        </div>
      </div>
    </div>
  )
}
