"use client"

import { showError } from "@/app/components/utils/showToasts";
import { access, allUsers } from "@/app/components/utils/userUtils"
import { useUserStore } from "@/app/hooks/useStore";
import Pagination from "@mui/material/Pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { ImCross } from "react-icons/im";
import { TiTick } from "react-icons/ti";

export default function Users() {

    const [pageSize, setPageSize] = useState(8);
    const [pageNumber, setPageNumber] = useState(0);
    const [users, setUsers] = useState([]);
    const [role, setRole] = useState("user");
    const [dropdown, setDropdown] = useState(false);
    const queryClient = useQueryClient();
    const { user } = useUserStore();

    const { data, isPending } = useQuery({
        queryKey: ["allUsers", pageNumber, pageSize, role],
        queryFn: () => allUsers(pageNumber, pageSize, role),
        select: (response) => response?.data,
    });

    useEffect(() => {
        if (isPending) return;
        if (data?.success && data?.data) {
            console.log("user list: ", data);
            setUsers(data?.data?.content);
        }
        else {
            showError(data?.error);
            console.log("Data for userS:", data);
        }
    }, [isPending, data])

    const { mutate, isPending: accessPending } = useMutation({
        mutationFn: access,
        onSuccess: (response) => {
            console.log(response);
            queryClient.invalidateQueries({
                queryKey: ["allUsers", pageNumber, pageSize, role]
            });
        },
        onError: (error) => {
            console.log(error);
        }
    })

    function handleRole(prop) {
        setRole(prop);
        setDropdown(!dropdown);
        setPageNumber(0);
    }

    function handleAdminAccess(id) {
        if (accessPending) return;
        mutate(id);
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
            <div className={`grid ${role == "user" ? "grid-cols-6" : "grid-cols-5"} gap-4 p-2 border-b-2 text-center *:font-semibold mx-10`}>
                <span>UserId</span>
                <span>Name</span>
                <span>Phone</span>
                <span>Email</span>
                <span>{role == "user" ? "No of Orders" : "Access & Privileges"}</span>
                {role == "user" && <span>BlockList</span>}
            </div>
            <div className="loop mx-10">
                {users?.map((item, index) => {
                    return (
                        <div key={index} className="flex flex-col gap-2">
                            <div className={`grid ${role == "user" ? "grid-cols-6" : "grid-cols-5"} gap-4 p-2 text-center`}>
                                <span>{item.id}</span>
                                <span>{item.name}</span>
                                <span>{item.phone}</span>
                                <span>{item.email}</span>
                                {role == "user" ? item.orderCount :
                                    user?.role == "SUPERUSER" ? item.active ?
                                        <div className="flex gap-2 items-center mx-auto">
                                            <span className="bg-green-700 p-2 text-white rounded-xl">Access Granted</span>
                                            <ImCross className="text-red-700 text-xl cursor-pointer" onClick={() => handleAdminAccess(item.id)} />
                                        </div> :
                                        <div className="flex gap-2 items-center mx-auto">
                                            <span className="bg-red-700 p-2 text-white rounded-xl">Access Revoked</span>
                                            <TiTick className="text-green-700 text-xl cursor-pointer" onClick={() => handleAdminAccess(item.id)} />
                                        </div> : <span className={`${item.active ? "bg-green-700" : "bg-red-700"} p-2 text-white rounded-xl`}>{item.active ? "Access Granted" : "Access Revoked"}</span>
                                }
                                {role === "user" && <span>Not Blocked</span>}
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