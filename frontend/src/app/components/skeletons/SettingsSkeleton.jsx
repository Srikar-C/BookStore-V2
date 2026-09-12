import Skeleton from "@mui/material/Skeleton";
import skeletonStyle from "./skeletonStyle";

export default function SettingsSkeleton() {
    return (
        <div className="grid grid-cols-[0.3fr_1fr] gap-3 p-4 overflow-hidden w-full h-full bg-(--background) rounded-xl">

            <div className="h-full">
                <div className="flex flex-col gap-5 border-r-2 border-(--shadow) items-center w-full h-full p-1">
                    <section className="flex flex-col gap-2 w-full">
                        <div className="flex items-center gap-3 p-3 rounded-xl">
                            <Skeleton variant="circular" width={24} height={24} sx={skeletonStyle} />
                            <Skeleton variant="text" width={80} height={28} sx={skeletonStyle} />
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl">
                            <Skeleton variant="circular" width={24} height={24} sx={skeletonStyle} />
                            <Skeleton variant="text" width={80} height={28} sx={skeletonStyle} />
                        </div>
                    </section>

                    <section className="flex flex-col gap-2 mt-auto w-full">
                        <div className="flex items-center gap-3 p-3 rounded-xl">
                            <Skeleton variant="circular" width={24} height={24} sx={skeletonStyle} />
                            <Skeleton variant="text" width={110} height={28} sx={skeletonStyle} />
                        </div>
                    </section>
                </div>
            </div>
            <div className="h-full overflow-y-auto">
                <div className="flex flex-col gap-5 p-4">
                    <Skeleton variant="text" width={180} height={45} sx={skeletonStyle} />
                    <div className="flex flex-col gap-4">
                        {Array.from({ length: 3 }, (_, index) => (
                            <Skeleton key={index} variant="rounded" width="100%" height={55} sx={skeletonStyle} />
                        ))}
                    </div>

                </div>

            </div>

        </div>
    );
}