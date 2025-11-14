import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Sidebar() {
    const navigate = useNavigate();
  return (
    <div className='max-w-20 bg-blue-300 h-40'>
        <div onClick={() => navigate("/")}>
          <p >Dashboard</p>
        </div>
        <div onClick={() => navigate("/request")}>Request</div>
        <div onClick={() => navigate("/template")}>Template</div>
        <div onClick={() => navigate("/report")}>Report</div>
        <div onClick={() => navigate("/history")}>History</div>
    </div>
  )
}
