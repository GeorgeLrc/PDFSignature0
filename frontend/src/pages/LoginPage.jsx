import Branding from '@/features/auth/Branding'
import LoginForm from '@/features/auth/LoginForm'

export default function LoginPage() {

  return (
    <div className="flex items-center justify-center min-h-screen px-4 mx-auto max-w-7xl md:px-6 lg:px-24">
      <div className="flex flex-col items-center justify-center w-full lg:flex-row lg:gap-16">
        {/* Left */}
        <Branding />

        {/* Right*/}
        <LoginForm />
      </div>
    </div>
  )
}