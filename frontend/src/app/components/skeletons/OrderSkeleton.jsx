import Skeleton from "@mui/material/Skeleton";
import skeletonStyle from "./skeletonStyle";

export default function OrdersSkeleton({ times = 5 }) {

    return (
        <div className="flex flex-col overflow-y-auto w-full h-full bg-(--background) rounded-xl p-3">

            <Skeleton variant="text" width={120} height={48} sx={skeletonStyle} />
            <div className="flex flex-col gap-3">
                {Array.from({ length: times }, (_, index) => (
                    <div
                        key={index}
                        className="flex flex-col gap-3 p-4 border-2 border-(--foreground) rounded-xl"
                    >
                        <div className="flex justify-between items-center">
                            <Skeleton variant="text" width={150} height={30} sx={skeletonStyle} />
                            <Skeleton variant="rounded" width={80} height={28} sx={skeletonStyle} />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col gap-1">
                                <Skeleton variant="text" width={80} height={22} sx={skeletonStyle} />
                                <Skeleton variant="text" width={120} height={28} sx={skeletonStyle} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Skeleton variant="text" width={80} height={22} sx={skeletonStyle} />
                                <Skeleton variant="text" width={100} height={28} sx={skeletonStyle} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <Skeleton variant="text" width={80} height={22} sx={skeletonStyle} />
                                <Skeleton variant="text" width={130} height={28} sx={skeletonStyle} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <Skeleton variant="text" width={80} height={22} sx={skeletonStyle} />
                                <Skeleton variant="text" width={70} height={28} sx={skeletonStyle} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}