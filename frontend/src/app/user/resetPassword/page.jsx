"use client"

import { useAppContext } from "@/app/hooks/AppContext";
import { useState } from "react";
import { useForm } from "react-hook-form";
import InputBox from "../components/InputBox";
import { FaUserAlt } from "react-icons/fa";
import { MdOutlinePassword } from "react-icons/md";
import { resetPassword } from "@/app/components/utils/userUtils";
import { showError, showSuccess } from "@/app/components/utils/showToasts";
import { useMutation } from "@tanstack/react-query";
import { getColor } from "@/app/components/utils/FunctionalUtils";

export default function ResetPassword() {

    const { router } = useAppContext();
    const { register, handleSubmit, formState, setValue, setError } = useForm({
        defaultValues: {
            email: "",
            password: "",
            cfnpassword: "",
        }
    });
    const { errors } = formState;
    const [focusedField, setFocusedField] = useState(null);

    const emailColor = getColor("email", focusedField, errors)
    const passwordColor = getColor("password", focusedField, errors);
    const cfnpasswordColor = getColor("cfnpassword", focusedField, errors);


    const { mutate: changingPassword, isPending } = useMutation({
        mutationFn: resetPassword,
        onSuccess: (response) => {
            showSuccess(response.data.message);
            router.replace("/user/login");
        },
        onError: (error) => {
            const errorResult = error.data;
            if (error.status === 400) {
                setValue("cfnpassword", "");
                setError("cfnpassword", {
                    type: "validation",
                    message: "Not Same as Password"
                })
            }
            else {
                showError(errorResult.message);
            }
        }
    })

    async function onSubmit(data) {
        changingPassword(data)
    }

    return (
        <div className="right rounded-l-2xl p-6 lg:p-10 flex flex-col gap-4 justify-evenly w-full">
            <div className="heading">
                <h3 className="text-4xl font-semibold">Reset Password</h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="inputs flex flex-col gap-5">
                <InputBox label="Email" field="email" icon={<FaUserAlt />} loading={isPending} register={register} setFocusedField={setFocusedField} errors={errors.email?.message} color={emailColor} type="text" />
                <InputBox label="Password" field="password" icon={<MdOutlinePassword />} loading={isPending} register={register} setFocusedField={setFocusedField} errors={errors.password?.message} color={passwordColor} type="password" />
                <InputBox label="Confirm Password" field="cfnpassword" icon={<MdOutlinePassword />} loading={isPending} register={register} setFocusedField={setFocusedField} errors={errors.cfnpassword?.message} color={cfnpasswordColor} type="password" />
                <button type="submit" className={`${isPending ? "cursor-not-allowed" : "cursor-pointer"} flex w-full items-center justify-center gap-2 rounded-2xl bg-(--input-icon) px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90`}
                >{isPending ? "Submitting..." : "Submit"}</button>
            </form>
        </div>
    )
}