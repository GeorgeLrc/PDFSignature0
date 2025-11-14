import Spinner from "@/ui/Spinner";
import useAllTemplates from "./useAllTemplates";
import { ImageMinus } from "lucide-react";
import Menus from "@/ui/Menus";
import Modal from "@/ui/modals/Modal";
import { useNavigate } from "react-router-dom";

export default function AllUserTemplateList() {
    const { publicTemplates, templatesLoading } = useAllTemplates();
    const navigate = useNavigate();
    

    if (!publicTemplates) return <Spinner />

    return (
        <Menus>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {
                    publicTemplates && publicTemplates?.map((template, index) => {
                        const fileUrl = `${import.meta.env.VITE_BACKEND_URL}/files/${template.filePath}`;
                        return (
                            <div key={index} className="relative p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700 border-slate-300">
                                <Modal>
                                    <div className="absolute z-50 top-6 right-7">
                                        <Menus.Toggle id={template._id} />
                                    </div>

                                    <div
                                        className="cursor-pointer"
                                        onClick={() => navigate(`/templates/${template._id}`)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" || event.key === " ") {
                                                navigate(`/templates/${template._id}`);
                                            }
                                        }}
                                    >
                                        <div className="relative w-full h-64 overflow-hidden border rounded-lg md:h-44 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 dark:border-slate-700 flex items-center justify-center">
                                            {template.filePath ? (
                                                <div className="relative w-full h-full">
                                                    <object
                                                        data={`${fileUrl}#page=1&toolbar=0&navpanes=0&scrollbar=0`}
                                                        type="application/pdf"
                                                        className="absolute inset-0 w-full h-full pointer-events-none"
                                                    >
                                                        <div className="flex flex-col items-center justify-center h-full text-slate-600 dark:text-slate-400">
                                                            <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            <span className="text-sm font-medium">PDF Document</span>
                                                        </div>
                                                    </object>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-slate-500">
                                                    <ImageMinus className="size-12 mb-2" />
                                                    <span className="text-sm">No file</span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="mt-3 text-xl font-semibold text-center dark:text-slate-50">
                                            {template.title}
                                        </h3>
                                    </div>
                                </Modal>
                            </div>
                        );
                    })
                }
            </div>
        </Menus>
    )
}
