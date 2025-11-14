/* eslint-disable react/prop-types */
export default function ConfirmAction({ title = 'Confirm Action', description = '', confirmLabel = 'Confirm', onCloseModal, onAction, disabled }) {
    return (
        <>
            <div className="flex items-center gap-3 p-4 bg-blue-600 rounded-t-md">
                <div className="p-2 bg-white rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">{title}</h2>
            </div>

            <div className="p-6 text-sm text-gray-700 dark:text-slate-50">
                <p>{description}</p>
            </div>

            <div className="flex justify-end gap-4 px-6 pb-4">
                <button
                    disabled={disabled}
                    onClick={onCloseModal}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md dark:hover:text-slate-700 dark:text-slate-50 hover:bg-gray-100"
                >
                    Cancel
                </button>
                <button
                    disabled={disabled}
                    onClick={async () => {
                        await onAction();
                        onCloseModal();
                    }}
                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {disabled ? 'Processing...' : confirmLabel}
                </button>
            </div>
        </>
    )
}
