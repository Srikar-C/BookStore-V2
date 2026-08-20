
"use client"
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import Link from "next/link";
import { FaUserAlt } from "react-icons/fa";
import { MdOutlinePassword } from "react-icons/md";
import { useAppContext } from "@/app/components/common/AppContext";
import { useState } from "react";
import { colors } from "../styles/style";
import InputBox from "../components/InputBox";

export default function Login() {

    const { loading, setLoading, router, isSubmit } = useAppContext();
    const { register, control, handleSubmit, formState } = useForm({
        defaultValues: {
            name: "",
            password: "",
        }
    });
    const { errors } = formState;
    const [focusedField, setFocusedField] = useState(null);

    const getColor = (field) => {
        if (errors[field]) {
            return colors.error;
        }

        if (focusedField === field) {
            return colors.focus;
        }

        return colors.normal;
    };

    const nameColor = getColor("name");
    const passwordColor = getColor("password");

    function onSubmit(data) {
        if (isSubmit.current) return;
        isSubmit.current = true;
        setLoading(true);
        try {
            setTimeout(() => {
                console.log(data);

            }, 1000);
        }
        finally {
            setLoading(false);
            isSubmit.current = false;
        }
    }

    return (
        <div className="right rounded-l-2xl p-6 lg:p-10 flex flex-col gap-4 justify-evenly w-full">
            <div className="heading">
                <h3 className="text-4xl font-semibold">Welcome Back</h3>
                <p className="text-sm text-slate-500">Access your account to buy books, track orders, and enjoy priority support.</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="inputs flex flex-col gap-5">
                <InputBox label="Username" field="name" icon={<FaUserAlt />} loading={loading} register={register} setFocusedField={setFocusedField} errors={errors.name?.message} color={nameColor} />
                <InputBox label="Password" field="password" icon={<MdOutlinePassword />} loading={loading} register={register} setFocusedField={setFocusedField} errors={errors.password?.message} color={passwordColor} />
                {/* <div className="password w-full flex flex-col gap-2">
                    <div className="label capitalize">Password</div>
                    <div className={`flex gap-3 items-center w-full shadow-xs p-3 rounded-2xl border-2 ${loading && "cursor-not-allowed"} focus-within:border-(--input-icon) transition-colors duration-200`} style={{ borderColor: passwordColor }}>
                        <span className="text-2xl text-(--input-icon)"><MdOutlinePassword /></span>
                        <input type="text" className={`border-none outline-none w-[90%] ${loading && "cursor-not-allowed"}`}
                            {...register("password", {
                                required: {
                                    value: true,
                                    message: "Password required"
                                }
                            })} placeholder="Enter Password" onFocus={() => setFocusedField("password")}
                            onBlur={() => setFocusedField(null)} />
                    </div>
                    <div className={`error my-0 leading-1.5 h-[1vh] text-sm font-semibold`} style={{ color: passwordColor }}>{errors.password?.message}</div>
                </div> */}
                <DevTool control={control} />
                <button type="submit" className={`${loading ? "cursor-not-allowed" : "cursor-pointer"} flex w-full items-center justify-center gap-2 rounded-2xl bg-(--input-icon) px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90`}
                >Submit</button>
            </form>
            <div className="footer flex lg:flex-row flex-col items-center justify-between font-semibold mt-5 lg:mt-0 gap-5 lg:gap-0">
                <Link href="/user/forgotPassword" onClick={(e) => loading && e.preventDefault()}
                    className={`${loading ? "cursor-not-allowed" : "cursor-pointer"} text-(--input-icon)`}>Forgot Password?</Link>
                <Link href="/user/register" onClick={(e) => loading && e.preventDefault()}
                    className={`${loading ? "cursor-not-allowed" : "cursor-pointer"} text-(--input-icon)`}>Create an Account</Link>
            </div>
        </div>
    )
}