import loginDisplay from '@/assets/login_page.png'
import logoImage from '@/assets/logo.png'
import { cn } from '@/utils/cn'

export default function Branding() {

    return (
        <div className="w-full h-full md:w-1/2">
            <div className='relative flex-col items-center justify-center hidden gap-8 lg:flex md:items-start'>
                <h1 className={cn('text-2xl font-medium leading-normal tracking-wide text-center md:text-3xl md:text-left dark:text-slate-50')}>
                    Sign in to <br />
                    <span className='text-primary'>Digital Signature System</span>
                </h1>
                <p className={cn('max-w-xs text-center md:text-left dark:text-slate-50')}>
                    If you don’t have an account register, <br /><strong className='text-primary'>You can Contact the IT department!</strong>
                </p>
                <img src={loginDisplay} alt="login_display" className='absolute w-56 right-5 top-16 h-52' />
            </div>
            <div className='flex items-center justify-center gap-3 mb-4 lg:hidden'>
                <img src={logoImage} alt="doitung_log" className='w-20' />
                <div className={cn('w-0.5 h-8  bg-gray-200 dark:bg-gray-700')}></div>
                <h2 className='text-lg font-medium text-primary'>Digital Signature System</h2>
            </div>
        </div>
    )
}
