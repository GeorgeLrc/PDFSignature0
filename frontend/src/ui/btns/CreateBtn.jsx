/* eslint-disable react/prop-types */
import { HiPlus } from "react-icons/hi2";

export default function CreateBtn({ text }) {
    return (
        <button
            className='flex items-center gap-1 px-4 py-1.5 text-white transition-colors duration-200 bg-green-600 rounded-md hover:bg-green-700'>
            <HiPlus className="text-yellow-300" /> {text}
        </button>
    );
}