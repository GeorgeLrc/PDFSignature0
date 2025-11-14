import CreateBtn from "@/ui/btns/CreateBtn";
import Title from "@/ui/Title";
import TemplatesList from "@/features/template/TemplatesList";
import Modal from "@/ui/modals/Modal";
import UploadTemplateModal from "../features/template/UploadTemplateModal";
import TemplateOperation from "../features/template/TemplateOperation";
import { motion } from "framer-motion";
import { IconFileText, IconUpload } from "@tabler/icons-react";

export default function TemplatePage() {
    return (
        <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* Header Section */}
            <div className="glass-card p-8 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-emerald-500/10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
                            <IconFileText size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold gradient-text">Template Library</h1>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage document templates and forms</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <TemplateOperation />
                        <Modal>
                            <Modal.Open opens='upload-template'>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <CreateBtn text='Upload Template' icon={IconUpload} />
                                </motion.div>
                            </Modal.Open>

                            <Modal.Window name='upload-template' width='600px'>
                                <UploadTemplateModal />
                            </Modal.Window>
                        </Modal>
                    </div>
                </div>
            </div>

            {/* Templates Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <TemplatesList />
            </motion.div>
        </motion.div>
    )
}
