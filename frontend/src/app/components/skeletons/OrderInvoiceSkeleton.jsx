import Skeleton from "@mui/material/Skeleton";
import skeletonStyle from "./skeletonStyle";
import { Fragment } from "react";

export default function OrderInvoiceSkeleton({ books = 4 }) {

    return (
        <div className="p-4 overflow-y-auto w-full h-full bg-(--background) rounded-xl flex flex-col gap-3">

            <div className="flex items-center gap-1">
                <Skeleton variant="text" width={24} height={28} sx={skeletonStyle} />
                <Skeleton variant="text" width={110} height={28} sx={skeletonStyle} />
            </div>

            <div className="grid grid-cols-[0.8fr_0.8fr] gap-10">
                <div className="left flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <Skeleton variant="text" width={180} height={48} sx={skeletonStyle} />

                        <div className="flex items-center gap-1">
                            <Skeleton variant="circular" width={22} height={22} sx={skeletonStyle} />
                            <Skeleton variant="text" width={80} height={30} sx={skeletonStyle} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 p-3 border-2 border-(--foreground) rounded-xl">
                        <Skeleton variant="text" width={160} height={32} sx={skeletonStyle} />
                        <div className="grid grid-cols-[1fr_1fr] gap-4">
                            {[...Array(6)].map((_, index) => (
                                <Fragment key={index}>
                                    <Skeleton variant="text" width={110} height={28} sx={skeletonStyle} />
                                    <Skeleton variant="text" width="90%" height={28} sx={skeletonStyle} />
                                </Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 p-3 border-2 border-(--foreground) rounded-xl">
                        <Skeleton variant="text" width={140} height={32} sx={skeletonStyle} />
                        <div className="grid grid-cols-[1fr_1fr] gap-4">
                            <Skeleton variant="text" width={110} height={28} sx={skeletonStyle} />
                            <Skeleton variant="text" width={50} height={28} sx={skeletonStyle} />
                            <Skeleton variant="text" width={110} height={28} sx={skeletonStyle} />
                            <Skeleton variant="text" width={80} height={28} sx={skeletonStyle} />
                        </div>
                    </div>
                </div>
                <div className="right flex flex-col">
                    <Skeleton variant="text" width={170} height={38} sx={skeletonStyle} />
                    <div className="max-h-[70vh] overflow-y-auto">
                        {[...Array(books)].map((_, index) => (
                            <div key={index} className="flex flex-col">
                                <div className="grid grid-cols-[0.2fr_0.5fr_0.2fr] gap-3 p-2 items-center content-center justify-center">
                                    <Skeleton variant="rounded" width={80} height={96} sx={skeletonStyle} />
                                    <div className="flex flex-col items-center gap-2">
                                        <Skeleton variant="text" width="80%" height={30} sx={skeletonStyle} /> <Skeleton variant="text" width={130} height={25} sx={skeletonStyle} />
                                    </div>
                                    <Skeleton variant="text" width={60} height={30} sx={skeletonStyle} />
                                </div>
                                <hr className="text-(--hr)" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}