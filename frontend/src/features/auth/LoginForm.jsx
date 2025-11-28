import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { cn } from "@/utils/cn"
import { useForm } from "react-hook-form"
import { LogInFormFieldsSchema } from "@/utils/zSchema"
import { PASSWORD_REQUIREMENTS_TEXT } from "@/utils/passwordRules"
import useLogin from "./useLogin"

export default function LoginForm() {
    const { logInUser, isLoggingIn } = useLogin()
    const [isVisible, setIsVisible] = useState(false)

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            email: 'mtt123@digital.com',
            password: 'mtt1234'
        },
        resolver: zodResolver(LogInFormFieldsSchema)
    })

    const isWorking = isSubmitting || isLoggingIn

    /**
     * @TODO: Implement login
     */
    const onHandleSubmitForm = (data) => {
        logInUser({ email: data.email, password: data.password })
    }
    return (
                <form onSubmit={handleSubmit(onHandleSubmitForm)}
                            className='relative w-full max-w-sm p-6 space-y-6 bg-white rounded-lg md:w-1/2 dark:bg-slate-900 shadow-xl animate-fadeIn'
                            style={{ animation: 'fadeIn 0.8s cubic-bezier(0.4,0,0.2,1)' }}>
                        <h2 className="text-2xl mb-2 tracking-tight pt-2 pr-4" style={{fontFamily: 'Playwrite CU, cursive'}}>
                            <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent font-bold">Welcome back&nbsp;&nbsp;</span>
                        </h2>

            {/* Email */}
            <div>
                <input
                    id="email"
                    disabled={isWorking}
                    {...register('email')}
                    type="text"
                    placeholder="Enter email or user name"
                    className={cn("w-full p-4 text-sm transition-all duration-300 rounded-lg bg-lightPurple focus:outline-none focus:ring-1 focus:ring-gray-400", errors.email && "focus:ring-red-500")}
                />
                {errors.email && <span className="flex items-center gap-1 mt-1 text-sm text-red-600"><span className="text-base material-symbols-outlined">
                    error
                </span>{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="relative">
                <input
                    id="password"
                    disabled={isWorking}
                    {...register('password')}
                    type={isVisible ? "text" : "password"}
                    placeholder="Password"
                    className={cn("w-full p-4 text-sm transition-all duration-300 rounded-lg bg-lightPurple focus:outline-none focus:ring-1 focus:ring-gray-400", errors.password && "focus:ring-red-500")}
                />
                <span onClick={() => setIsVisible(!isVisible)} className="absolute flex items-center cursor-pointer top-4 right-4">
                    <span className="material-symbols-outlined text-[22px] text-gray-400">
                        {isVisible ? "visibility" : "visibility_off"}
                    </span>
                </span>
                {errors.password && (
                  <div className="flex items-start gap-1 mt-2 text-sm text-red-600">
                    <span className="text-base material-symbols-outlined flex-shrink-0 mt-0.5">error</span>
                    <div>
                      <div>{errors.password.message}</div>
                      <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded whitespace-pre-wrap dark:bg-gray-800 dark:text-gray-300">
                        {PASSWORD_REQUIREMENTS_TEXT}
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Login Button */}
            <button
                disabled={isWorking}
                type='submit'
                className={cn(
                    "relative flex items-center justify-center w-full py-3 mb-24 text-white font-semibold rounded-lg transition-all duration-300",
                    "bg-gradient-to-r from-red-500 via-red-600 to-red-700 shadow-lg hover:shadow-2xl hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-400/50",
                    "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-red-400 before:to-red-600 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-20",
                    isWorking && "cursor-not-allowed opacity-80 transform-none hover:scale-100"
                )}
                style={{
                    animation: 'slideUp 0.6s cubic-bezier(0.4,0,0.2,1)'
                }}>
                {isWorking && <svg className="mr-3 -ml-1 text-white size-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                <span className="relative z-10">{isWorking ? 'Signing in...' : 'Sign in'}</span>
            </button>

            <p className='max-w-xs text-center lg:hidden dark:text-slate-50'>
                If you don’t have an account register, <strong className='text-primary'>You can Contact the IT department!</strong>
            </p>
        </form>
    )
}
