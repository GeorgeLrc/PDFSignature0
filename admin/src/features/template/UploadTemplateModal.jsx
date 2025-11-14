/* eslint-disable react/prop-types */
import { IconBookmark, IconFileText, IconUpload } from "@tabler/icons-react";
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
            <h2 className="flex items-center gap-3 mb-8 text-2xl font-bold gradient-text">
                <div className="p-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white">
                    <IconBookmark size={24} />
                </div>
                <span>Upload New Template</span>
            </h2>
            <form onSubmit={handleSubmit(onHandleUpload)} className="space-y-6">

                <div>
                    <label htmlFor="title" className="block mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Template Title</label>
                    <input
                        id="title"
                        disabled={isWorking}
                        type="text"
                        {...register('title')}
                        className={cn(
                            'input',
                            errors.title
                                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-slate-200 dark:border-slate-600 focus:border-primary focus:ring-primary/20'
                        )}
                        placeholder="Enter a descriptive title for your template"
                    />
                    {errors.title && <span className="text-xs italic text-red-500 mt-1 block">{errors.title.message}</span>}
                </div>

                <div
                    disabled={isWorking}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => inputRef.current.click()}
                    className="glass-card p-8 flex flex-col items-center justify-center h-64 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-300 cursor-pointer group bg-gradient-to-br from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10"
                >
                    <div className="p-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                        <IconFileText size={32} />
                    </div>
                    <p className="text-center text-slate-600 dark:text-slate-300 mb-2 font-medium">
                        Drag and drop a PDF file here
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        or <span className="text-primary font-semibold cursor-pointer hover:underline">browse files</span>
                    </p>
                    <div className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                        PDF files only
                    </div>
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
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                                <IconFileText size={20} className="text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="font-medium text-green-800 dark:text-green-300">File Selected</p>
                                <p className="text-sm text-green-600 dark:text-green-400">{file.name}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-600/60">
                    <input
                        disabled={isWorking}
                        type="checkbox"
                        id="isPublic"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="w-5 h-5 text-primary border-slate-300 dark:border-slate-600 rounded focus:ring-primary focus:ring-2 accent-primary"
                    />
                    <label htmlFor="isPublic" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Make this template public for all users</label>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        disabled={isWorking}
                        onClick={onCloseModal}
                        className="btn-secondary flex-1 justify-center"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isWorking}
                        type="submit"
                        className="btn-primary flex-1 justify-center"
                    >
                        <IconUpload size={18} />
                        {isWorking ? 'Uploading...' : 'Upload Template'}
                    </button>
                </div>
            </form>
        </>
    );
}