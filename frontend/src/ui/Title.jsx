/* eslint-disable react/prop-types */
import useTheme from "@/hooks/useTheme";
import { cn } from "@/utils/cn";

export default function Title({ title }) {
    const { isDark } = useTheme();
    return (
        <h1 className={cn('title', isDark && 'text-slate-50')}>{title}</h1>
    )
}
