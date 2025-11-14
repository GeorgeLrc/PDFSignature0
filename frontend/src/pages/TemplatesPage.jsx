import CreateBtn from "@/ui/btns/CreateBtn";
import TemplatesList from "@/features/template/TemplatesList";
import Modal from "@/ui/modals/Modal";
import UploadTemplateModal from "../features/template/UploadTemplateModal";
import TemplateOperation from "../features/template/TemplateOperation";
import AllUserTemplateList from "../features/template/AllUserTemplateList";

export default function TemplatePage() {
    return (
        <section className="space-y-12">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                <div className="flex flex-col gap-6 border-b border-white/20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-8 text-white sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl">
                        <h1 className="text-2xl font-semibold sm:text-3xl">Manage Templates</h1>
                        <p className="mt-2 text-sm font-medium text-white/80">
                            Curate, share, and reuse your signature-ready PDFs. Quickly update existing templates or add new ones for your team.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <TemplateOperation />
                        <Modal>
                            <Modal.Open opens="upload-template">
                                <div>
                                    <CreateBtn text="Upload" />
                                </div>
                            </Modal.Open>

                            <Modal.Window name="upload-template" width="450px">
                                <UploadTemplateModal />
                            </Modal.Window>
                        </Modal>
                    </div>
                </div>

                <div className="space-y-10 px-6 py-8 sm:px-8">
                    <TemplatesList />

                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-100">
                                Public Templates
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Browse ready-to-use templates shared by your organization.
                            </p>
                        </div>
                        <AllUserTemplateList />
                    </div>
                </div>
            </div>
        </section>
    );
}
