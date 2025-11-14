import defaultImage from '@/assets/default.jpg';

export default function Avatar() {


    return (
        <>
            <img src={defaultImage} alt="" className='w-10 h-10 border rounded-full cursor-pointer dark:border-slate-700 border-slate-300' />
        </>
    )
}
