import Spinner from "@/ui/Spinner";
import useAllTemplates from "./useAllTemplates";
import useDeleteTemplate from './useDeleteTemplate'
import { IconFileOff, IconEye } from "@tabler/icons-react";
import Menus from "@/ui/Menus";
import Modal from "@/ui/modals/Modal";
import ConfirmDelete from '@/ui/modals/ConfirmDelete'
import { IconPencil, IconTrash } from "@tabler/icons-react";
import RenameTemplateModal from "./RenameTemplateModal";
import TemplatePreviewModal from "./TemplatePreviewModal";
import { useSearchParams } from "react-router-dom";

export default function TemplatesList() {
    const { templates, templatesLoading } = useAllTemplates()
    const { deleteTemplate, isDeleting } = useDeleteTemplate()

    const [searchParams] = useSearchParams()

    const filterValue = searchParams.get('isPublic') ?? 'all'
    let filteredTemplates;

    if (filterValue === 'all') filteredTemplates = templates
    if (filterValue === 'true') filteredTemplates = templates?.filter(template => template.isPublic)
    if (filterValue === 'false') filteredTemplates = templates?.filter(template => !template.isPublic)

    if (templatesLoading) return <Spinner />

    return (
        <Menus>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {
                    filteredTemplates?.length > 0 ? (
                        filteredTemplates?.map((template, index) => {
                        const fileUrl = `${import.meta.env.VITE_BACKEND_URL}/files/${template.filePath}`;
                        return (
                            <div key={index} className="glass-card relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border border-slate-200/60 dark:border-slate-700/60 p-4">
                                <Modal>
                                    <div className="absolute z-50 top-4 right-4 flex items-center gap-2">
                                        <Modal.Open opens='preview-modal'>
                                            <button className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 shadow hover:text-blue-600 hover:border-blue-400 transition-colors" title="Preview template">
                                                <IconEye size={18} />
                                            </button>
                                        </Modal.Open>
                                        <Menus.Toggle id={template._id} />
                                    </div>
                                    {/* Edit & Delete */}
                                    <Menus.List id={template._id}>
                                        <Modal.Open opens='rename-form'>
                                            <Menus.Button icon={<IconPencil size={16} className="text-blue-500" />}>Edit</Menus.Button>
                                        </Modal.Open>

                                        <Modal.Open opens='delete'>
                                            <Menus.Button icon={<IconTrash size={16} className="text-red-500" />}>Delete</Menus.Button>
                                        </Modal.Open>
                                    </Menus.List>

                                    {/* Edit Form */}
                                    <Modal.Window name='rename-form' width='450px'>
                                        <RenameTemplateModal currentId={template._id} currentTitle={template.title} />
                                    </Modal.Window>

                                    {/* Delete Form */}
                                    <Modal.Window name='delete' width='450px' padding={false}>
                                        <ConfirmDelete type='template' disabled={isDeleting} onAction={() => deleteTemplate(template._id)} />
                                    </Modal.Window>

                                    {/* Preview Modal */}
                                    <Modal.Window name='preview-modal' width='90vw'>
                                        <TemplatePreviewModal template={template} fileUrl={fileUrl} />
                                    </Modal.Window>

                                    <div className="cursor-pointer group-hover:scale-[1.01] transition-transform duration-300">
                                        <div className="relative w-full h-48 overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 border border-slate-200/60 dark:border-slate-700/60">
                                            {fileUrl ? (
                                                <iframe
                                                    src={`${fileUrl}#page=1&toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                                                    title={template.title}
                                                    className="absolute inset-0 w-full h-full"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400 gap-3 text-sm">
                                                    <IconFileOff size={40} />
                                                    <span>No Preview</span>
                                                </div>
                                            )}

                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-[1px]" />
                                        </div>
                                        <div className="mt-3 space-y-1 text-center px-2">
                                            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate">
                                                {template.title}
                                            </h3>
                                            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">{template.isPublic ? 'Public' : 'Private'}</p>
                                        </div>
                                    </div>
                                </Modal>
                            </div>
                        );
                    })
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                            <IconFileOff size={64} className="text-slate-400 dark:text-slate-500 mb-4" />
                            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">No Templates Found</h3>
                            <p className="text-slate-500 dark:text-slate-500">Upload your first template to get started</p>
                        </div>
                    )
                }
            </div>
        </Menus>
    )
}
