/* eslint-disable react/prop-types */
import { IconDownload, IconX, IconCalendar, IconEye } from "@tabler/icons-react";

export default function TemplatePreviewModal({ template, fileUrl, onCloseModal }) {
    const formattedDate = template?.uploadedAt
        ? new Date(template.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Unknown date';
    const visibilityLabel = template?.isPublic ? 'Public Template' : 'Private Template';

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 flex items-center gap-2">
                        <IconEye size={14} /> {visibilityLabel}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
                        {template?.title}
                    </h2>
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <IconCalendar size={16} /> Uploaded {formattedDate}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {fileUrl && (
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-colors"
                        >
                            <IconDownload size={16} /> Download PDF
                        </a>
                    )}
                    <button
                        type="button"
                        onClick={onCloseModal}
                        className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        <IconX size={16} /> Close
                    </button>
                </div>
            </div>

            <div className="h-[70vh] rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                {fileUrl ? (
                    <iframe
                        src={`${fileUrl}#toolbar=1&navpanes=0`}
                        title={template?.title}
                        className="w-full h-full"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                        No preview available
                    </div>
                )}
            </div>
        </div>
    )
}
