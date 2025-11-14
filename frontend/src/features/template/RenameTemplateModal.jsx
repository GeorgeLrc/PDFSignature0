/* eslint-disable react/prop-types */
import { cn } from "@/utils/cn";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { uploadTemplateFormFieldSchema } from "../../utils/zSchema";
import useRenameTemplate from "./useRenameTemplate";
import { ClipboardEdit } from "lucide-react";

export default function RenameTemplateModal({ currentId, currentTitle, onCloseModal }) {
    const { renameTemplate, isRenaming } = useRenameTemplate()

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: { title: currentTitle },
        resolver: zodResolver(uploadTemplateFormFieldSchema)
    })

    const isWorking = isSubmitting || isRenaming

    const onHandleRename = (data) => {
        renameTemplate({ templateId: currentId, newTitle: data.title }, {
            onSuccess: () => {
                onCloseModal?.()
                reset({ title: '' })
            }
        })
    };

    return (
        <>
            <h2 className="flex items-center gap-2 mb-4 text-lg font-bold text-indigo-700">
                <ClipboardEdit /> <span>Rename Template</span>
            </h2>
            <form onSubmit={handleSubmit(onHandleRename)} className="space-y-4">

                <input
                    disabled={isWorking}
                    type="text"
                    {...register('title')}
                    className={cn(
                        'w-full px-3 py-2 transition-all duration-500 border rounded-md focus:outline-0 dark:bg-slate-700',
                        errors.title
                            ? 'border-red-600 dark:border-red-600 focus:border-red-500 dark:focus:border-red-600'
                            : 'border-slate-300 dark:border-slate-500 focus:border-indigo-500 dark:focus:border-indigo-500'
                    )}
                />
                {errors.title && <span className="text-xs italic text-red-500">{errors.title.message}</span>}

                <div className="flex justify-between mt-6">
                    <button
                        disabled={isWorking}
                        type="button"
                        onClick={onCloseModal}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md dark:text-slate-50 dark:hover:text-slate-700 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isWorking}
                        type="submit"
                        className="px-4 py-2 text-white bg-indigo-700 rounded-md disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                        {isWorking ? "Renaming..." : "Rename"}
                    </button>
                </div>
            </form>
        </>
    );
}