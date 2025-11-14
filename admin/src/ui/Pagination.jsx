/* eslint-disable react/prop-types */
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../utils/constants";

export default function Pagination({ count }) {
    const [searchParams, setSearchParams] = useSearchParams()

    const currentPage = !searchParams.get('page') ? 1 : Number(searchParams.get('page'))

    const totalPage = Math.ceil(count / PAGE_SIZE)

    const isFirstPage = currentPage === 1
    const isLastPage = currentPage === totalPage

    const prevPage = () => {
        const previous = isFirstPage ? currentPage : currentPage - 1
        searchParams.set('page', previous)
        setSearchParams(searchParams)
    }

    const nextPage = () => {
        const next = isLastPage ? currentPage : currentPage + 1
        searchParams.set('page', next)
        setSearchParams(searchParams)
    }

    if (totalPage <= 1) return null

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-lg">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Showing{' '}
                <span className="font-bold text-primary">{(currentPage - 1) * PAGE_SIZE + 1}</span>
                {' '}to{' '}
                <span className="font-bold text-primary">{isLastPage ? count : currentPage * PAGE_SIZE}</span>
                {' '}of{' '}
                <span className="font-bold text-primary">{count}</span>
                {' '}results
            </p>
            
            <div className="flex items-center gap-2">
                <button
                    disabled={isFirstPage}
                    onClick={prevPage}
                    type="button"
                    className="pagination-btn">
                    <IconChevronLeft size={18} stroke={2} />
                    Previous
                </button>

                <div className="flex items-center justify-center min-w-[80px] px-4 py-2.5 font-bold text-primary bg-primary/5 dark:bg-primary/10 rounded-xl">
                    {currentPage} / {totalPage}
                </div>

                <button
                    disabled={isLastPage}
                    onClick={nextPage}
                    type="button"
                    className="pagination-btn">
                    Next
                    <IconChevronRight size={18} stroke={2} />
                </button>
            </div>
        </div>
    )
}
