import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context-api/AppContext";


// eslint-disable-next-line react/prop-types
export const ProfileInfo = ({ onLogout }) => {
  const navigate = useNavigate();
  const { userData, } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-blue-400 cursor-pointer"
          onClick={toggleModal}
        >
          <img src={userData.image} alt="" />
        </div>
        
      </div>

      {isModalOpen && (
        <div className="absolute top-16 right-0 w-48 bg-white shadow-lg rounded-lg p-4">
          <ul className="space-y-2">
            <li>
              <button
                className="w-full text-left text-slate-900 hover:bg-slate-100 px-2 py-1 rounded"
                onClick={() => {
                  navigate("/profile")
                  toggleModal();
                }}
              >
                View Profile
              </button>
            </li>
            
            <li>
              <button
                className="w-full text-left text-red-600 hover:bg-red-100 px-2 py-1 rounded"
                onClick={() => {
                  onLogout();
                  toggleModal();
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};