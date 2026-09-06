import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export default function Theme() {

    return (
        <div className="fixed top-3.5 right-3 rounded-full bg-(--foreground) flex items-end justify-start p-1 z-50 shadow-2xl border-2 border-(--background)">
            <AnimatedThemeToggler className="text-(--background) cursor-pointer" />
        </div>
    )
}