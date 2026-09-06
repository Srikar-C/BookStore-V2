"use client"
import { useAppContext } from "@/app/components/common/AppContext";
import { allUsers } from "@/app/components/utils/userUtils"
import Pagination from "@mui/material/Pagination";
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

export default function Users() {

    const [pageSize, setPageSize] = useState(8);
    const [pageNumber, setPageNumber] = useState(0);
    const [users, setUsers] = useState([]);
    const [role, setRole] = useState("user");
    const [dropdown, setDropdown] = useState(false);

    const { data, isPending } = useQuery({
        queryKey: ["allUsers", pageNumber, pageSize, role],
        queryFn: () => allUsers(pageNumber, pageSize, role),
        select: (response) => response?.data,
    })

    useEffect(() => {
        if (isPending) return;
        if (data?.success && data?.data) {
            console.log("user list: ", data);
            setUsers(data?.data?.content);
        }
    }, [isPending, data])

    function handleRole(prop) {
        setRole(prop);
        setDropdown(!dropdown);
        setPageNumber(0);
    }

    return (
        <div className="flex flex-col gap-4 w-full h-full bg-(--background) rounded-xl p-4 overflow-y-auto">
            <div className="flex justify-between items-center px-4">
                <h4 className="font-serif font-semibold text-xl">All Users</h4>
                <div className="options flex gap-4">
                    <div className={`dropdown relative border-2 border-gray-600 flex items-center justify-center`}>
                        <span className="font-semibold text-md mx-auto items-center px-3 cursor-pointer w-20 text-center" onClick={() => setDropdown(!dropdown)}>{role.toUpperCase()}</span>
                        <div className={`values absolute ${dropdown ? "flex" : "hidden"} *:cursor-pointer z-10 bg-(--background) flex-col gap-2 border-2 border-gray-500 top-10 px-4 py-1`}>
                            <span onClick={() => handleRole("user")}>Users</span>
                            <span onClick={() => handleRole("admin")}>Admins</span>
                        </div>
                    </div>
                    <div className="size flex items-center gap-2 border-2 border-gray-600 p-2">
                        <span>{data?.data?.isLast ? data?.data?.totalElements : pageSize * (pageNumber + 1)}</span>
                        <span>/</span>
                        <span>{data?.data?.totalElements}</span>
                    </div>
                    <div className="size flex items-center gap-2">
                        <span>Page Size</span>
                        <input type="text" className="w-7.5 text-center border-2 border-gray-600" value={pageSize} onChange={(e) => {
                            setPageSize(e.target.value);
                            setPageNumber(0);
                        }} />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-5 gap-4 p-2 border-b-2 text-center *:font-semibold mx-10">
                <span>UserId</span>
                <span>Name</span>
                <span>Phone</span>
                <span>Email</span>
                <span>No of Orders</span>
            </div>
            <div className="loop mx-10">
                {users?.map((item, index) => {
                    return (
                        <div key={index} className="flex flex-col gap-2">
                            <div className="grid grid-cols-5 gap-4 p-2 text-center">
                                <span>{item.id}</span>
                                <span>{item.name}</span>
                                <span>{item.phone}</span>
                                <span>{item.email}</span>
                                <span>No of Orders</span>
                            </div>
                            <hr className="text-(--hr)" />
                        </div>
                    )
                })}
            </div>
            <div className="pagintion w-full flex justify-center">
                <Pagination count={Math.max(data?.data?.totalPages, 1)} page={pageNumber + 1} color="secondary"
                    shape="rounded" size="large" onChange={(event, page) => {
                        setPageNumber(page - 1);
                    }}
                    sx={{
                        "& .MuiPaginationItem-root": {
                            color: "var(--foreground)",
                            borderColor: "var(--foreground)",
                        },
                        "& .Mui-selected": {
                            backgroundColor: "var(--input-icon) !important",
                            color: "#fff",
                        },
                    }} />
            </div>
        </div>
    )
}