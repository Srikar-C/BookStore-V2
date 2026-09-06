"use client"
import { useAppContext } from "@/app/components/common/AppContext";
import { Section } from "@/app/components/utils/FunctionalUtils";
import Modal from '@mui/material/Modal';
import { usePathname } from "next/navigation";
import { FaStar } from "react-icons/fa";
import { MdDeleteOutline, MdOutlinePassword } from "react-icons/md";
import { RiAccountCircleLine } from "react-icons/ri";
import { useState } from "react";
import InputBox from "@/app/user/components/InputBox";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { deleteUser, passwordVerify } from "@/app/components/utils/userUtils";
import { showError } from "@/app/components/utils/showToasts";

export default function SettingsAside() {

    const pathName = usePathname();
    const { router } = useAppContext();
    const [open, setOpen] = useState(false);
    const { register, handleSubmit } = useForm({
        defaultValues: {
            password: "",
        }
    });
    const [delte, setDelte] = useState(false);

    const { mutate: verify, isPending: verifyPending } = useMutation({
        mutationFn: passwordVerify,
        onSuccess: (response) => {
            console.log(response);
            setDelte(true);
        },
        onError: (error) => {
            console.log(error);
            showError(error.data.error);
        }
    })

    const { mutate: deletion, isPending: deletePending } = useMutation({
        mutationFn: deleteUser,
        onSuccess: (response) => {
            console.log(response);
        },
        onError: (error) => {
            console.log(error);
        }
    })

    function handleAccount() {
        router.push("/bookstore/settings");
    }

    function handleWishlist() {
        router.push("/bookstore/settings/wishlist");
    }

    function onSubmit(data) {
        console.log(data);
        { !delte && verify(data.password) }
        { delte && deletion() }
    }


    return (
        <div className={`flex flex-col gap-5 border-r-2 border-(--shadow) items-center w-full h-full p-1 `}>
            <section className="flex flex-col gap-2 w-full">
                <Section icon={<RiAccountCircleLine />} text="Account" click={handleAccount} path="/bookstore/settings/account" url={pathName} />
                <Section icon={<FaStar />} text="Wishlist" click={handleWishlist} path="/bookstore/settings/wishlist" url={pathName} />
            </section>
            <section className="flex flex-col gap-2 mt-auto w-full">
                <Section icon={<MdDeleteOutline />} text="Delete Account" click={() => setOpen(true)} path="/bookstore/settings/delete" url={pathName} />
            </section>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl w-100 h-65 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-3 flex flex-col gap-5">

                    {!delte ? <h4 className="text-2xl font-semibold">Please confirm your password to delete your account</h4> :
                        <div className="flex flex-col gap-3">
                            <h4 className="text-2xl font-semibold">Please Delete your Account</h4>
                            <p className="text-slate-700">This leads in deleting entire data including orders and carts</p>

                        </div>}
                    {!delte && <InputBox label="Password" field="password" icon={<MdOutlinePassword />} register={register} setFocusedField={null} type="password" />}
                    {!delte && <button type="submit"
                        className={`${verifyPending ? "cursor-not-allowed" : "cursor-pointer"} mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-(--input-icon) px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90`}>
                        Submit
                    </button>}
                    {delte && <button type="submit"
                        className={`${deletePending ? "cursor-not-allowed" : "cursor-pointer"} mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90`}>
                        Delete Account
                    </button>}
                </form>
            </Modal>
        </div>
    )
}