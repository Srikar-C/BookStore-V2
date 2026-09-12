import Skeleton from "@mui/material/Skeleton";

export default function UserSkeleton({ times }) {

    const skeletonStyle = {
        bgcolor: "var(--skeleton-bg)",
        "&::after": {
            background:
                "linear-gradient(90deg, transparent, var(--skeleton-wave), transparent)",
        },
    };

    return (
        <div className="right rounded-l-2xl p-6 lg:p-10 flex flex-col gap-4 justify-evenly">
            <Skeleton variant="text" width="80%" height={44} sx={skeletonStyle} />
            {Array.from({ length: times }, (_, index) => (
                <div className="flex flex-col gap-2" key={index}>
                    <Skeleton variant="text" width={80} height={44} sx={skeletonStyle} />
                    <Skeleton variant="rounded" width="100%" height={36} sx={skeletonStyle} />
                </div>
            ))}
            <Skeleton variant="rounded" width="100%" height={36} sx={skeletonStyle} />
            <div className="btns flex justify-between">
                <Skeleton variant="text" width={100} height={44} sx={skeletonStyle} />
                <Skeleton variant="text" width={100} height={44} sx={skeletonStyle} />
                <Skeleton variant="text" width={100} height={44} sx={skeletonStyle} />
            </div>
        </div>
    )
}