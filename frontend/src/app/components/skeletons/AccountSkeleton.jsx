import Skeleton from "@mui/material/Skeleton";
import skeletonStyle from "./skeletonStyle";

export default function AccountSkeleton() {
    return (
        <div className="flex flex-col gap-4 p-4">
            <Skeleton variant="text" width={150} height={35} sx={skeletonStyle} />
            <div className="grid grid-cols-2 gap-3 border-2 border-(--foreground) p-3 rounded-xl">
                <Skeleton variant="text" width={70} height={28} sx={skeletonStyle} />
                <Skeleton variant="text" width="70%" height={28} sx={skeletonStyle} />
                <Skeleton variant="text" width={70} height={28} sx={skeletonStyle} />
                <Skeleton variant="text" width="60%" height={28} sx={skeletonStyle} />
                <Skeleton variant="text" width={70} height={28} sx={skeletonStyle} />
                <Skeleton variant="text" width="80%" height={28} sx={skeletonStyle} />
                <Skeleton variant="text" width={70} height={28} sx={skeletonStyle} />
                <Skeleton variant="text" width="50%" height={28} sx={skeletonStyle} />
                <Skeleton variant="rounded" width={150} height={42} sx={{
                    ...skeletonStyle,
                    marginTop: "8px",
                }} />
            </div>
            <div className="flex flex-col gap-5 border-2 border-(--foreground) p-3 rounded-xl">
                <Skeleton variant="text" width={70} height={35} sx={skeletonStyle} />
                <div className="flex gap-5">
                    {Array.from({ length: 2 }, (_, index) => (
                        <div key={index} className="flex flex-col justify-between px-4 py-1 rounded-lg w-62.5 h-[15vh] items-center">
                            <Skeleton variant="text" width="100%" height="100%" sx={skeletonStyle} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}