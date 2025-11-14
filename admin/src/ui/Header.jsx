/* eslint-disable react/prop-types */
import { IconMenu2, IconX } from '@tabler/icons-react';
import useTheme from '@/hooks/useTheme';
import ThemeToggleBtn from './btns/ThemeToggleBtn'
import { cn } from '@/utils/cn';
import Avatar from './Avatar';
import Modal from './modals/Modal';
import ProfileModal from './modals/ProfileModal';

export default function Header({ collapsed, setCollapsed }) {
    const { isDark } = useTheme();

    return (
        <>
            <header className={cn('relative h-[70px] flex z-20 items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 transition-all duration-300',
                isDark && 'bg-slate-900/80 border-slate-700/60')}>
                
                {/* Left side */}
                <div className='flex items-center gap-x-4'>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={cn('group flex items-center justify-center h-10 w-10 transition-all duration-200 rounded-xl gap-x-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20', 
                            isDark && 'text-slate-400 hover:bg-slate-800 hover:text-blue-400')}>
                        <div className="relative">
                            {collapsed ? 
                                <IconMenu2 size={22} stroke={2} className="transition-transform group-hover:scale-110" /> : 
                                <IconX size={22} stroke={2} className="transition-transform group-hover:scale-110" />
                            }
                        </div>
                    </button>
                </div>

                {/* Right side */}
                <Modal>
                    <div className="flex items-center gap-x-3">
                        <ThemeToggleBtn />

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

                        <Modal.Open opens={'logout'}>
                            <div className="cursor-pointer">
                                <Avatar />
                            </div>
                        </Modal.Open>

                        <Modal.Window name={'logout'} padding={false}>
                            <ProfileModal />
                        </Modal.Window>
                    </div>
                </Modal>
            </header>
        </>
    );
}