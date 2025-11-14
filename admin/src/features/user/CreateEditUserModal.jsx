/* eslint-disable react/prop-types */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserFormFieldSchema } from "@/utils/zSchema";
import { cn } from "@/utils/cn";
import { UserCog, UserPlus } from "lucide-react";
import useCreateUser from "./useCreateUser";
import useEditUser from "./useEditUser";

export default function CreateEditUserModal({ userToEdit = {}, onCloseModal }) {
    const { _id: editId, ...editValues } = userToEdit
    const isEditSession = Boolean(editId)

    const { createUser, isCreating } = useCreateUser()
    const { editUser, isEditing } = useEditUser()

    const [preview, setPreview] = useState(userToEdit?.image || "")

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: isEditSession ? editValues : {},
        resolver: zodResolver(createUserFormFieldSchema)
    })

    const isWorking = isSubmitting || isCreating || isEditing

    const onSubmitForm = (data) => {
        const formData = new FormData();
        formData.append('first_name', data.first_name);
        formData.append('last_name', data.last_name);
        formData.append('email', data.email);
        formData.append('password', data.password);

        if (isEditSession) {
            formData.append('image', data?.editImage[0] ? data?.editImage[0] : data?.image[0]);
            editUser({ userId: editId, userData: formData }, {
                onSuccess: () => {
                    onCloseModal?.()
                    reset({
                        first_name: '',
                        last_name: '',
                        email: '',
                        password: ''
                    })
                }
            })
        }
        else {
            formData.append('image', data?.image[0]);
            createUser(formData, {
                onSuccess: () => {
                    onCloseModal?.()
                    reset({
                        first_name: '',
                        last_name: '',
                        email: '',
                        password: ''
                    })
                }
            })
        }
    }

    const onHandlePreview = (file) => {
        const reader = new FileReader()

        reader.readAsDataURL(file)

        reader.onload = () => {
            setPreview(reader.result)
        }
    }

    return (
        <>
            <h2 className="flex items-center gap-2 pb-4 mb-4 text-xl font-bold text-indigo-700 border-b dark:border-b-slate-700 border-slate-300">
                {isEditSession ? <UserCog /> : <UserPlus />}
                <span>{isEditSession ? "Edit User" : "Create User"}</span>
            </h2>
            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
                <div className="flex w-full gap-4">
                    <div className="flex flex-col w-1/2 space-y-1">
                        <label className="text-sm" htmlFor="first_name">First Name <span className="text-red-600">*</span></label>
                        <input
                            id="first_name"
                            disabled={isWorking}
                            {...register('first_name')}
                            type="text"
                            placeholder="First Name"
                            className={cn(
                                'w-full px-3 py-2 transition-all duration-500 border rounded-md focus:outline-0 dark:bg-slate-700',
                                errors.first_name
                                    ? 'border-red-600 dark:border-red-600 focus:border-red-500 dark:focus:border-red-600'
                                    : 'border-slate-300 dark:border-slate-500 focus:border-indigo-500 dark:focus:border-indigo-500'
                            )}
                        />
                        {errors.first_name && <span className="text-xs italic text-red-600">{errors.first_name.message}</span>}
                    </div>
                    <div className="flex flex-col w-1/2 space-y-1">
                        <label className="text-sm" htmlFor="last_name">Last Name <span className="text-red-600">*</span></label>
                        <input
                            id="last_name"
                            disabled={isWorking}
                            {...register('last_name')}
                            type="text"
                            placeholder="Last Name"
                            className={cn(
                                'w-full px-3 py-2 transition-all duration-500 border rounded-md focus:outline-0 dark:bg-slate-700',
                                errors.last_name
                                    ? 'border-red-600 dark:border-red-600 focus:border-red-500 dark:focus:border-red-600'
                                    : 'border-slate-300 dark:border-slate-500 focus:border-indigo-500 dark:focus:border-indigo-500'
                            )}
                        />
                        {errors.last_name && <span className="text-xs italic text-red-600">{errors.last_name.message}</span>}
                    </div>
                </div>
                <div className="flex flex-col space-y-1">
                    <label className="text-sm" htmlFor="email">Email <span className="text-red-600">*</span></label>
                    <input
                        id="email"
                        disabled={isWorking}
                        {...register('email')}
                        type="email"
                        placeholder="Email"
                        className={cn(
                            'w-full px-3 py-2 transition-all duration-500 border rounded-md focus:outline-0 dark:bg-slate-700',
                            errors.email
                                ? 'border-red-600 dark:border-red-600 focus:border-red-500 dark:focus:border-red-600'
                                : 'border-slate-300 dark:border-slate-500 focus:border-indigo-500 dark:focus:border-indigo-500'
                        )}
                    />
                    {errors.email && <span className="text-xs italic text-red-500">{errors.email.message}</span>}
                </div>
                <div className="flex flex-col space-y-1">
                    <label className="text-sm" htmlFor="password">Password <span className="text-red-600">*</span></label>
                    <input
                        id="password"
                        disabled={isWorking}
                        {...register('password')}
                        type="password"
                        placeholder="Password"
                        className={cn(
                            'w-full px-3 py-2 transition-all duration-500 border rounded-md focus:outline-0 dark:bg-slate-700',
                            errors.password
                                ? 'border-red-600 dark:border-red-600 focus:border-red-500 dark:focus:border-red-600'
                                : 'border-slate-300 dark:border-slate-500 focus:border-indigo-500 dark:focus:border-indigo-500'
                        )}
                    />
                    {errors.password && <span className="text-xs italic text-red-600">{errors.password.message}</span>}
                </div>
                <div className="flex flex-col space-y-1">
                    <label className="text-sm" htmlFor="image">Profile Image <span className="text-red-600">*</span></label>
                    <div className="flex items-center justify-between">
                        <input
                            id="image"
                            accept="image/*"
                            disabled={isWorking}
                            {...register(isEditSession ? 'editImage' : 'image')}
                            onChange={(e) => onHandlePreview(e.target.files[0])}
                            type="file"
                        />
                        {!!preview && <img alt="profile_image" src={preview} className="w-10 h-10 bg-gray-500 rounded-full" />}
                    </div>
                    {errors.image && <span className="text-xs italic text-red-600">{errors.image.message}</span>}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        disabled={isWorking}
                        type="button"
                        onClick={onCloseModal}
                        className="px-4 py-2 text-gray-600 transition-all duration-200 bg-gray-200 rounded-md disabled:cursor-not-allowed hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isWorking}
                        type="submit"
                        className="px-4 py-2 text-white transition-all duration-200 bg-indigo-600 rounded-md disabled:cursor-not-allowed disabled:bg-gray-300 hover:bg-indigo-700"
                    >
                        {isWorking ? isEditSession ? 'Updating...' : 'Creating...' : isEditSession ? 'Update' : 'Create'}
                    </button>
                </div>
            </form>
        </>
    )
}
