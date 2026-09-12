import BookSkeleton from "./BookSkeleton";
import SideNavSkeleton from "./SideNavSkeleton";
import TopNavSkeleton from "./TopNavSkeleton";

export default function BookStoreSkeleton({ children }) {
    return (
        <div className={`grid grid-cols-[0.15fr_1fr] grid-rows-[0.05fr_1fr] py-2 px-1.5 gap-1 h-screen w-screen bg-gray-400`}>
            <aside className="row-span-2">
                <SideNavSkeleton />
            </aside>

            <header className="flex items-center">
                <TopNavSkeleton />
            </header>

            <main className="overflow-auto h-full">
                <div className="grid grid-rows-[auto_1fr_auto] items-start overflow-y-auto w-full h-full bg-(--background) rounded-xl p-3"></div>
            </main>
        </div>
    )
}