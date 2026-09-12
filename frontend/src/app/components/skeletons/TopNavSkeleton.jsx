import Skeleton from "@mui/material/Skeleton";
import skeletonStyle from "./skeletonStyle";

export default function TopNavSkeleton() {

    return (
        <div className="flex items-center gap-3 justify-between bg-(--background) px-5 py-2 w-full rounded-lg h-[8vh]">
            <div className="left">
                <h2 className="text-xl font-semibold">Welcome Back!</h2>
            </div>
            <div className="right flex gap-6 mr-10">
                {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton key={index} variant="text" width={100} height={50} sx={skeletonStyle} />
                ))}
            </div>
        </div>
    )
}