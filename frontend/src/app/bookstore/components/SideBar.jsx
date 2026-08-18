import { Section } from "@/app/components/utils/FunctionalUtils";
import { useUserStore } from "@/app/hooks/useStore";
import Avatar from '@mui/material/Avatar';
import { usePathname } from "next/navigation";
import { FaBook, FaShoppingCart, FaUsers } from "react-icons/fa";
import { MdFeedback, MdOutlineSpaceDashboard } from "react-icons/md";
import { RiProfileLine, RiSettingsFill } from "react-icons/ri";
import { LuBadgeHelp } from "react-icons/lu";
import { IoMdLogOut } from "react-icons/io";
import { useAppContext } from "@/app/components/common/AppContext";
import { useMutation } from "@tanstack/react-query";
import { showError } from "@/app/components/utils/showToasts";
import { logout } from "@/app/components/utils/userUtils";
import Hamburger from "@/app/components/common/Hamburger";

export default function SideBar({ sidebarOpen, setSidebarOpen }) {

    const { user } = useUserStore();
    const pathName = usePathname();
    const { router } = useAppContext();

    const { mutate } = useMutation({
        mutationFn: logout,
        onSuccess: () => {
            router.replace("/");
        },
        onError: (response) => {
            showError(response.message);
        }
    })

    if (user == null) return;

    function addNewBook() {
        router.push("/bookstore/new");
    }

    function handleBook() {
        router.push("/bookstore");
    }

    function handleCart() {
        router.push("/bookstore/carts");
    }

    function handleOrder() {
        router.push("/bookstore/orders");
    }

    return (
        <div className="main flex flex-col gap-1 py-3 px-2 bg-(--background) rounded-xl w-full h-full relative">
            <div className="user flex gap-2 items-center mb-5">
                <div className="logo flex">
                    <Avatar sx={{
                        bgcolor: "var(--input-icon)",
                        color: "white",
                    }}>{user.name.substring(0, 2).toUpperCase()}</Avatar>
                </div>
                <div className="dtls flex flex-col gap-0 items-center">
                    <h4 className="tracking-widest">{user.name.toUpperCase()}</h4>
                    <p className="text-xs text-slate-500">{user.role}</p>
                </div>
                {/* <div className="float-right">
                    <Hamburger opened={sidebarOpen} onClick={() => setSidebarOpen(prev => !prev)} />
                </div> */}
            </div>
            <hr className="text-(--hr)" />
            <div className="sections flex flex-col gap-3">
                <section className="flex flex-col gap-2">
                    <h3 className="text-sm text-slate-500">MAIN</h3>
                    <Section icon={<MdOutlineSpaceDashboard />} text="Dashboard" click={handleBook} path="/bookstore" url={pathName} />
                </section>
                <hr className="text-(--hr)" />

                <section className="flex flex-col gap-2">
                    <h3 className="text-sm text-slate-500">SETTINGS</h3>
                    {user.role == "USER" ?
                        <Section icon={<RiSettingsFill />} text="Orders" click={handleOrder} path="/bookstore/orders" url={pathName} /> :
                        <Section icon={<FaUsers />} text="Users" path="/bookstore/users" url={pathName} />}
                    {user.role == "USER" && <Section icon={<FaShoppingCart />} text="Carts" path="/bookstore/carts" click={handleCart} url={pathName} />}
                    <Section icon={<RiProfileLine />} text="Profile" path="/bookstore/profile" url={pathName} />
                </section>
                <hr className="text-(--hr)" />

                {user.role == "ADMIN" &&
                    <section className="flex flex-col gap-2 mt-auto">
                        <h3 className="text-sm text-slate-500">MANAGEMENT</h3>
                        <Section icon={<FaBook />} text="Add New Book" click={addNewBook} path="/bookstore/new" url={pathName} />
                    </section>}
                {user.role == "ADMIN" && <hr className="text-(--hr)" />}

                <section className="flex flex-col gap-2">
                    <h3 className="text-sm text-slate-500">SUPPORT</h3>
                    <Section icon={<MdFeedback />} text="Suggestions" path="/bookstore/suggestions" url={pathName} />
                    <Section icon={<LuBadgeHelp />} text="Help" path="/bookstore/help" url={pathName} />
                </section>
            </div>
            {/* {user.role == "ADMIN" && <hr className="text-[color:var(--hr)]" />} */}
            <section className="flex flex-col gap-3 mt-auto">
                <hr className="text-(--hr)" />
                <Section icon={<IoMdLogOut />} text="Logout" click={() => mutate()} path="/logout" url={pathName} />
            </section>
        </div>
    )
}