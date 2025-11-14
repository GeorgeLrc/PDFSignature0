import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context-api/AppContext'
import { ProfileInfo } from '../components/ProfileInfo';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Navbar() {
  const { isLoggedIn, backendUrl, setUserData, setIsLoggedIn } = useContext(AppContext)
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      if (data.success) {
        setIsLoggedIn(false)
        setUserData(false)
        navigate("/login")
      }
    } catch (error) {
      toast.error(error.message)
    }
  }
  return (
    <div className='flex flex-row items-center justify-between px-10'>
      {/* logo */}
      <div>Logo</div>
      {/* profile */}
      <div>
        {
          isLoggedIn &&
          (
            <ProfileInfo onLogout={onLogout} />
          )
        }
      </div>
    </div>
  )
}
