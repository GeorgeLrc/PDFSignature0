/* eslint-disable react/prop-types */

export default function ConfirmDelete({ type, onCloseModal, onAction, disabled }) {
    return (
        <>
            <div className="flex items-center gap-3 p-4 bg-red-600 rounded-t-md">
                <div className="p-2 bg-white rounded-full">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m5 0H6"
                        />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">Delete {type === 'user' ? 'User Account.' : 'Template File.'}</h2>
            </div>

            <div className="p-6 text-sm text-gray-700 dark:text-slate-50">
                <p>{type === 'user' ? 'Are you sure you want to delete this user account?' : 'Are you sure you want to delete this template file?'}</p>
                <p className="mt-2">
                    If you delete this file, you will permanently lose this data.
                </p>
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
                    onClick={() => {
                        onAction()
                        onCloseModal()
                    }}
                    className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                    Delete
                </button>
            </div>
        </>
    );
}
