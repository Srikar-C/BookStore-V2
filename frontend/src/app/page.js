"use client"
import { NoiseTexture } from "@/components/ui/noise-texture";
import { ArrowRight, BookOpenText, ShieldCheck, ShoppingCart, Sparkles } from "lucide-react";
import Avatar from "@mui/material/Avatar";
import Link from "next/link";
import Snowfall from "react-snowfall";

export default function Home() {

  const features = [
    {
      icon: BookOpenText,
      title: "Curated discovery",
      text: "Explore hand-picked titles, trending categories, and personalized recommendations in one elegant bookstore hub.",
    },
    {
      icon: ShoppingCart,
      title: "Fast checkout",
      text: "Move from browsing to ordering quickly with a clean cart flow and streamlined purchase experience.",
    },
    {
      icon: ShieldCheck,
      title: "Secure experience",
      text: "Built for reliable account access, protected sessions, and customer-focused order management.",
    },
  ];


  const stats = [
    { label: "Books available", value: "10k+" },
    { label: "Happy readers", value: "24k" },
    { label: "Avg. delivery", value: "2-4 days" },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-(--background) text-(--foreground)">
      <Snowfall style={{
        color: "var(--background)",
      }} snowflakeCount={28} />
      <NoiseTexture className="absolute inset-0 h-full w-full opacity-40 " />
      <div className="absolute inset-0 h-full w-full z-[-100]" />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="h-[8vh] mt-8 rounded-full border border-(--foreground)/10 bg-white/10 flex justify-between items-center dark:bg-slate-950/40 backdrop-blur-sm px-6 py-8 shadow-lg shadow-(color:--shadow)/10">
          <div className="flex items-center gap-2">
            <Avatar sx={{
              bgcolor: "var(--foreground)",
              color: "var(--background)",
              fontSize: "16px",
            }}>B</Avatar>
            <span className="text-xl font-semibold tracking-wider">BookStore</span>
          </div>
          <div className={`btns flex gap-3 justify-around font-semibold italic *:cursor-pointer`}>
            <Link href="/user/login" className="text-(--foreground) bg-(--background) rounded-full border-2 border-(--foreground) px-3 py-1" >Login</Link>
            <Link href="/user/register" className="text-(--background) bg-(--foreground) rounded-full border-2 border-(--foreground) px-3 py-1" >Register</Link>
          </div>
        </nav>
      </div>
      <main className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:pt-20 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-300">
              <Sparkles className="h-4 w-4" />
              Discover your next favorite read
            </div>
            <div className="space-y-5">
              <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-7xl">
                A modern bookstore built for readers, shoppers, and everyday discovery.
              </h1>
              <p className="max-w-xl text-base text-(--foreground)/75 sm:text-lg">
                BookStore V2 brings together curated books, smooth browsing, and a clean shopping experience in one polished platform.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/books"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-(--foreground) px-6 py-3 text-base font-semibold text-(--background) shadow-lg shadow-(color:--shadow)/20 transition hover:scale-[1.02]"
              >
                Explore bookstore
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/user/register"
                className="inline-flex items-center justify-center rounded-full border border-(--foreground)/20 bg-white/5 px-6 py-3 text-base font-semibold transition hover:bg-(--foreground)/5"
              >
                Create account
              </Link>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-4 pt-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-(--foreground)/10 bg-white/5 p-4 backdrop-blur-sm dark:bg-slate-950/30">
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="mt-1 text-sm text-(--foreground)/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <section id="features" className="mx-auto mt-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
                Platform highlights
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Everything your bookstore needs in one place.</h2>
            </div>
            <div className="grid gap-6 md:grid-rows-3">
              {features.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-3xl border border-(--foreground)/10 bg-white/5 p-6 backdrop-blur-sm dark:bg-slate-950/30">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-(--foreground)/70">{text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

