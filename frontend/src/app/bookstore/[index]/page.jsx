"use client"
import InputBox from "@/app/user/components/InputBox";
import { useParams } from "next/navigation"
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaLink, FaUserAlt } from "react-icons/fa";
import { AiOutlineStock } from "react-icons/ai";
import { BiCategory } from "react-icons/bi";
import { IoPricetagsOutline } from "react-icons/io5";
import { MdDriveFileRenameOutline, MdOutlineDescription, MdSubtitles } from "react-icons/md";
import { getColor } from "@/app/components/utils/FunctionalUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addBook, editBook, getBook } from "@/app/components/utils/bookUtils";
import { showError, showSuccess } from "@/app/components/utils/showToasts";
import { useAppContext } from "@/app/components/common/AppContext";
import { useUserStore } from "@/app/hooks/useStore";

export default function Book() {

    const { index } = useParams();
    const isNew = (index === "new");
    const { user } = useUserStore();
    const { router } = useAppContext();
    const queryClient = useQueryClient();

    const { register, formState, handleSubmit, reset, setError } = useForm({
        defaultValues: {
            id: "",
            author: "",
            title: "",
            description: "",
            url: "",
            price: "",
            quantity: "",
            category: ""
        }
    })

    const { errors } = formState;
    const [focusedField, setFocusedField] = useState(null);

    const fields = ["author", "title", "description", "url", "price", "quantity", "category"];

    const colors = Object.fromEntries(
        fields.map((field) => [
            field,
            getColor(field, focusedField, errors)
        ])
    );

    const { data: bookData, isPending, isSuccess: bookSuccess } = useQuery({
        queryKey: ["indexedBook", index],
        queryFn: () => getBook(index),
        enabled: !isNew,
    });

    useEffect(() => {
        if (!isNew && bookSuccess && bookData?.data) {
            const data = bookData.data.data;
            reset({
                id: data.id,
                author: data.author,
                title: data.title,
                description: data.description,
                url: data.url,
                price: data.price,
                quantity: data.quantity,
                category: data.category,
            })
        }
    }, [isNew, bookData, bookSuccess, reset]);

    const { mutate: addingBook, isPending: addPending } = useMutation({
        mutationFn: addBook,
        onSuccess: (response) => {
            const result = response.data;
            if (response.status === 201) {
                showSuccess(result.message);
                router.replace("/bookstore");
            }
        },
        onError: (error) => {
            if (error.status === 400) {
                const errors = error.data;
                Object.entries(errors).forEach(([field, message]) => {
                    setError(field, {
                        type: "validation",
                        message: message
                    });
                });
                return;
            }
            else if (error.status === 409) {
                const result = error.data;
                const errors = result.error;
                Object.entries(errors).forEach(([field, message]) => {
                    setError(field, {
                        type: "exists",
                        message: message
                    });
                });
                if (errors?.book) {
                    showError(errors.book)
                }
                return;
            }
        }
    })

    const { mutate: editingBook, isPending: editPending } = useMutation({
        mutationFn: editBook,
        onSuccess: (response) => {
            const result = response.data;
            if (response.status === 200) {
                showSuccess(result.message);
                queryClient.invalidateQueries({
                    queryKey: ["allBooks"]
                })
                router.replace("/bookstore");
            }
        },
        onError: (error) => {
            if (error.status === 400) {
                const errors = error.data;
                Object.entries(errors).forEach(([field, message]) => {
                    setError(field, {
                        type: "validation",
                        message: message
                    });
                });
                return;
            }
            else if (error.status === 409) {
                const result = error.data;
                const errors = result.error;
                Object.entries(errors).forEach(([field, message]) => {
                    setError(field, {
                        type: "exists",
                        message: message
                    });
                });
                if (errors?.book) {
                    showError(errors.book)
                }
                return;
            }
        }
    })

    function onSubmit(data) {
        if (addPending || editPending) return;
        const request = {
            id: user.id,
            ...data
        }
        if (isNew) {
            addingBook(request);
        }
        else {
            editingBook({ id: index, request });
        }
    }

    if (!isNew && isPending) {
        return <div>Loading Book....</div>
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 place-items-center px-8 py-4 mx-auto overflow-auto h-full w-full bg-(--background) rounded-xl">

            <InputBox label="Title" field="title" icon={<MdSubtitles />} loading={addPending || editPending} register={register} setFocusedField={setFocusedField} errors={errors.title?.message} color={colors.title} type="text" />
            <InputBox label="Author" field="author" icon={<MdDriveFileRenameOutline />} loading={addPending || editPending} register={register} setFocusedField={setFocusedField} errors={errors.author?.message} color={colors.author} type="text" />

            <div className="col-span-2 col-start-1 row-start-2 w-full">
                <InputBox label="Description" field="description" icon={<MdOutlineDescription />} loading={addPending || editPending} register={register} setFocusedField={setFocusedField} errors={errors.description?.message} color={colors.description} type="text" />
            </div>

            <InputBox label="Image URL" field="url" icon={<FaLink />} loading={addPending || editPending} register={register} setFocusedField={setFocusedField} errors={errors.url?.message} color={colors.url} type="text" />
            <InputBox label="price" field="price" icon={<IoPricetagsOutline />} loading={addPending || editPending} register={register} setFocusedField={setFocusedField} errors={errors.price?.message} color={colors.price} type="text" />
            <InputBox label="quantity" field="quantity" icon={<AiOutlineStock />} loading={addPending || editPending} register={register} setFocusedField={setFocusedField} errors={errors.quantity?.message} color={colors.quantity} type="text" />
            <InputBox label="Category" field="category" icon={<BiCategory />} loading={addPending || editPending} register={register} setFocusedField={setFocusedField} errors={errors.category?.message} color={colors.category} type="text" />
            <button type="submit" disabled={addPending || editPending} className={`${addPending || editPending ? "cursor-not-allowed" : "cursor-pointer"} bg-(--foreground) hover:bg-(--background) col-span-2
                    text-(--background) hover:text-(--textground) hover:shadow-xs 
                    hover:shadow-(color:--foreground) py-2 rounded-2xl w-[60%] mx-auto`} >
                {isNew ? "Add New Book" : "Edit Book"}
            </button>

        </form>
    )
}