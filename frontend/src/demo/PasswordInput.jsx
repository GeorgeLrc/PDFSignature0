import { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

// eslint-disable-next-line react/prop-types
const PasswordInput = ({ value, onChange, placeholder }) => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };

  return (
    <div className="relative w-full">
      <input
        value={value}
        onChange={onChange}
        type={isShowPassword ? "text" : "password"}
        placeholder={placeholder || "Password"}
        className="w-full px-4 py-2 mt-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        type="button"
        onClick={toggleShowPassword}
        aria-label={isShowPassword ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-3 flex items-center justify-center text-gray-500"
      >
        {isShowPassword ? <FaRegEye size={22} /> : <FaRegEyeSlash size={22} />}
      </button>
    </div>
  );
};

export default PasswordInput;