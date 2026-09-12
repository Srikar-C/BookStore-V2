import Skeleton from "@mui/material/Skeleton";
import skeletonStyle from "./skeletonStyle";

export default function BookSkeleton() {

    return (
        <div className="grid grid-rows-[auto_1fr_auto] items-start overflow-y-auto w-full h-full bg-(--background) rounded-xl p-3">
            <div className="categories flex justify-between gap-3 p-2 h-[7vh]">
                <div className="categories flex gap-3">
                    {Array.from({ length: 5 }, (_, index) => (
                        <Skeleton key={index} variant="rounded" width={80} height={32} sx={skeletonStyle} />
                    ))}
                </div>
                <div className="options flex gap-3">
                    <Skeleton variant="rounded" width={75} height={38} sx={skeletonStyle} />
                    <div className="flex items-center gap-2">
                        <Skeleton variant="text" width={65} height={28} sx={skeletonStyle} />
                        <Skeleton variant="rounded" width={30} height={32} sx={skeletonStyle} />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 p-4">
                {Array.from({ length: 9 }, (_, index) => (
                    <div key={index} className="flex flex-col gap-3 p-3 rounded-xl">
                        <Skeleton variant="rounded" width="100%" height={220} sx={skeletonStyle} />
                        <Skeleton variant="text" width="80%" height={32} sx={skeletonStyle} />
                        <Skeleton variant="text" width="60%" height={25} sx={skeletonStyle} />
                        <div className="flex justify-between items-center">
                            <Skeleton variant="text" width={70} height={28} sx={skeletonStyle} />
                            <Skeleton variant="rounded" width={80} height={32} sx={skeletonStyle} />
                        </div>
                    </div>
                ))}
            </div>
            <div className="pagintion w-full flex justify-center p-2">
                <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }, (_, index) => (
                        <Skeleton key={index} variant="rounded" width={40} height={40} sx={skeletonStyle} />
                    ))}
                </div>
            </div>
        </div>
    );
}