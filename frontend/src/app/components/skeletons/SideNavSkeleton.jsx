import Skeleton from "@mui/material/Skeleton";
import skeletonStyle from "./skeletonStyle";

export default function SideNavSkeleton() {

    return (
        <div className="flex flex-col gap-1 py-3 px-2 bg-(--background) rounded-xl w-full h-full relative">
            <div className="user flex gap-2 items-center mb-5">
                <div className="logo flex">
                    <Skeleton variant="circular" width={40} height={40} sx={skeletonStyle} />
                </div>
                <div className="dtls flex flex-col items-center">
                    <Skeleton variant="text" width={80} height={30} sx={skeletonStyle} />
                    <Skeleton variant="text" width={50} height={24} sx={skeletonStyle} />
                </div>
            </div>
            {Array.from({ length: 5 }, (_, index) => (
                <div key={index}>
                    <hr className="text-(--hr)" />
                    <div className="sections flex flex-col gap-1">
                        <Skeleton variant="text" width={80} height={30} sx={skeletonStyle} />
                        <Skeleton variant="text" width="100%" height={40} sx={skeletonStyle} />
                    </div>
                </div>
            ))}
            <div className="sections flex flex-col mt-auto">
                <hr className="text-(--hr)" />
                <Skeleton variant="text" width="100%" height={50} sx={skeletonStyle} />
            </div>
        </div>
    )
}