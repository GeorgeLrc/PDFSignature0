import { useSearchParams } from "react-router-dom"

/* eslint-disable react/prop-types */
export default function Filter({ filterField, options }) {
    const [searchParams, setSearchParams] = useSearchParams()

    const currentValue = searchParams.get(filterField) || options[0].value

    const onHandleClick = (value) => {
        searchParams.set(filterField, value)
        if (searchParams.get('page')) searchParams.set('page', 1)
        setSearchParams(searchParams)
    }

    return (
        <div className="flex gap-2 p-1 border rounded-md shadow-sm border-slate-300 dark:border-slate-700">
            {
                options.map((opt, index) => (
                    <button
                        disabled={currentValue === opt.value}
                        onClick={() => onHandleClick(opt.value)}
                        key={index}
                        className={`${currentValue === opt.value ? 'bg-indigo-600 text-slate-50' : ''} p-1 px-2 text-sm dark:text-slate-50 font-bold transition-all duration-300 border-0 disabled:cursor-not-allowed rounded-md hover:bg-indigo-600 hover:text-slate-50`}>
                        {opt.label}
                    </button>
                ))
            }
        </div>
    )
}
