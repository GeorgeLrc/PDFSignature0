import { useSearchParams } from "react-router-dom"

/* eslint-disable react/prop-types */
export default function Filter({ filterField, options }) {
    const [searchParams, setSearchParams] = useSearchParams()

    const currentValue = searchParams.get(filterField) || options[0].value

    const onHandleClick = (value) => {
        setSearchParams((prevParams) => {
            const next = new URLSearchParams(prevParams)
            next.set(filterField, value)
            if (next.has('page')) next.set('page', '1')
            return next
        })
    }

    return (
        <div className="inline-flex gap-1.5 p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-xl shadow-lg">
            {
                options.map((opt, index) => (
                    <button
                        disabled={currentValue === opt.value}
                        onClick={() => onHandleClick(opt.value)}
                        key={index}
                        className={`
                            relative px-4 py-2 text-sm font-semibold rounded-lg
                            transition-all duration-300
                            ${currentValue === opt.value 
                                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md' 
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                            }
                            disabled:cursor-not-allowed
                            active:scale-95
                        `}
                    >
                        {opt.label}
                    </button>
                ))
            }
        </div>
    )
}
