import Skeleton from "@mui/material/Skeleton";
import skeletonStyle from "./skeletonStyle";

export default function UserSkeleton() {
    return (
        <div className="bg-(--background) w-full h-full rounded-l-lg">
            <div className="flex flex-col gap-2">
                {Array.from({ length: 6 }, (_, index) => (
                    <div>
                        <div className={`grid grid-cols-6 gap-4 p-2 justify-items-center`}>
                            {Array.from({ length: 6 }, (_, index) => (
                                <Skeleton variant="text" width={100} height={44} sx={skeletonStyle} />
                            ))}
                        </div>
                        <hr />
                    </div>
                ))}
            </div>
        </div>
    )
}