/* eslint-disable react/prop-types */
import { BookTemplate, FileTextIcon } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadTemplateFormFieldSchema } from "@/utils/zSchema";
import useUploadTemplate from '@/features/template/useUploadTemplate'
import toast from "react-hot-toast";

export default function UploadTemplateModal({ onCloseModal }) {
    const { uploadTemplate, isUploading } = useUploadTemplate()

    const [file, setFile] = useState(null);
    const [isPublic, setIsPublic] = useState(false);
    const inputRef = useRef();

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(uploadTemplateFormFieldSchema)
    })

    const isWorking = isSubmitting || isUploading

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === "application/pdf") {
            setFile(selected);
        } else {
            toast.error("Please select a PDF file.");
            e.target.value = null;
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (dropped && dropped.type === "application/pdf") {
            setFile(dropped);
        } else {
            toast.error('Only PDF files are allowed.');
        }
    };

    const handleDragOver = (e) => e.preventDefault();

    const onHandleUpload = (data) => {
        const formData = new FormData();
        formData.append("pdf", file);
        formData.append("title", data.title);
        formData.append("isPublic", isPublic);

        uploadTemplate(formData, {
            onSuccess: () => {
                onCloseModal?.()
                reset({
                    title: ''
                })
            }
        })
    };

    return (
        <>
            <h2 className="flex items-center gap-2 mb-6 text-xl font-bold text-indigo-700">
                <BookTemplate /><span>Upload new template</span>
            </h2>
            <form onSubmit={handleSubmit(onHandleUpload)} className="space-y-4 dark:text-slate-50">

                <div className="mb-4">
                    <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-700 dark:text-slate-50">Template Title</label>
                    <input
                        id="title"
                        disabled={isWorking}
                        type="text"
                        {...register('title')}
                        className={cn(
                            'w-full px-3 py-2 transition-all duration-500 border rounded-md focus:outline-0 dark:bg-slate-700',
                            errors.title
                                ? 'border-red-600 dark:border-red-600 focus:border-red-500 dark:focus:border-red-600'
                                : 'border-slate-300 dark:border-slate-500 focus:border-indigo-500 dark:focus:border-indigo-500'
                        )}
                        placeholder="Enter template title"
                    />
                    {errors.title && <span className="text-xs italic text-red-500">{errors.title.message}</span>}
                </div>

                <div
                    disabled={isWorking}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => inputRef.current.click()}
                    className="flex flex-col items-center justify-center h-56 mb-4 border border-indigo-300 border-dashed rounded-md cursor-pointer bg-indigo-50 dark:bg-slate-700 dark:text-slate-50"
                >
                    <FileTextIcon className="mb-2 text-slate-500 size-10" />
                    <p className="text-sm text-gray-600 dark:text-slate-50">
                        Drag and drop a PDF file or <span className="text-indigo-600 underline">choose file</span>
                    </p>
                    <input
                        id="template"
                        disabled={isWorking}
                        ref={inputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

                {!!file && (
                    <div className="mb-4 text-sm text-gray-700 dark:text-slate-50">
                        <span className="font-medium">Selected file:</span> {file.name}
                    </div>
                )}

                <div className="flex items-center mb-6 space-x-2">
                    <input
                        disabled={isWorking}
                        type="checkbox"
                        id="isPublic"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded accent-indigo-700 focus:ring-indigo-500"
                    />
                    <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-slate-50">Make this public</label>
                </div>

                <div className="flex justify-between">
                    <button
                        type="button"
                        disabled={isWorking}
                        onClick={onCloseModal}
                        className="px-4 py-2 text-gray-700 transition duration-500 border border-gray-300 rounded-md dark:hover:border-gray-300 dark:hover:text-slate-800 dark:text-slate-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isWorking}
                        type="submit"
                        className="px-4 py-2 text-white bg-indigo-700 rounded-md disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                        {isWorking ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </form>
        </>
    );
}