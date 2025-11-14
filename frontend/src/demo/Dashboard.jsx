import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context-api/AppContext'
import pdfPhoto from "../assets/pdf.jpg"
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {

  const { requests, getRequests, templatesByCurrentUser, getTemplatesByCurrentUser, recentTemplates, getRecentTemplatesByCurrentUser } = useContext(AppContext);

  const navigate = useNavigate();

  const [requestsCount, setRequestsCount] = useState(0);
  const [success, setSuccess] = useState(0)
  const [denied, setDenied] = useState(0)
  const [pending, setPending] = useState()

  const formatLastOpened = (lastOpened) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(lastOpened)) / 1000); // Difference in seconds

    if (diff < 60) return `Opened ${diff} sec ago`;
    if (diff < 3600) return `Opened ${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `Opened ${Math.floor(diff / 3600)} hours ago`;
    return `Opened ${Math.floor(diff / 86400)} days ago`;
  };


  useEffect(() => {
    getRequests();
    getTemplatesByCurrentUser();
    getRecentTemplatesByCurrentUser();
  }, [])

  useEffect(() => {
    if (requests && requests.length > 0) {
      setRequestsCount(requests.length);

      // Count statuses
      const successCount = requests.filter(req => req.status === "approved").length;
      const deniedCount = requests.filter(req => req.status === "rejected").length;
      const pendingCount = requests.filter(req => req.status === "pending").length;

      setSuccess(successCount);
      setDenied(deniedCount);
      setPending(pendingCount);
    }
  }, [requests])

  return (
    <div>
      <h2>Dashboard</h2><br />
      <div className='flex flex-row justify-evenly gap-2'>
        <div className='border border-black px-3 py-3'>Request <br /> {requestsCount}</div>
        <div className='border border-black px-3 py-3'>Success <br /> {success}</div>
        <div className='border border-black px-3 py-3'>Denied <br /> {denied}</div>
        <div className='border border-black px-3 py-3'>Pending <br /> {pending}</div>
      </div>
      <div>
        <h2>Template</h2>
        {/* Public Templates */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {templatesByCurrentUser &&
            templatesByCurrentUser.map((template, index) => (
              <div key={index} className="border rounded-lg shadow-md p-3 text-center">
                {/* Template Image */}
                <div className="h-40 flex justify-center items-center bg-gray-100 rounded">
                  {template.filePath ? (
                    <img
                      src={pdfPhoto}
                      alt={template.title}
                      className="h-full object-cover"
                    />
                  ) : (
                    <p className="text-gray-500">No Preview</p>
                  )}
                </div>

                {/* Template Title */}
                <p className="mt-2 font-semibold">{template.title}</p>

                {/* Buttons */}
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => navigate("/template/" + template._id)}
                    // onClick={() => showPdf(template.filePath)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Templates */}
      <div>
        <h2>Recent Templates</h2>
        {console.log(recentTemplates)}
        {/* Public Templates */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {recentTemplates &&
            recentTemplates.map((template, index) => (
              <div key={index} className="border rounded-lg shadow-md p-3 text-center">
                {/* Template Image */}
                <div className="h-40 flex justify-center items-center bg-gray-100 rounded">
                  {template.templateId.filePath ? (
                    <img
                      src={pdfPhoto}
                      alt={template.title}
                      className="h-full object-cover"
                    />
                  ) : (
                    <p className="text-gray-500">No Preview</p>
                  )}
                </div>

                {/* Template Title */}
                <p className="mt-2 font-semibold">{template.templateId.title}</p>
                <p>{formatLastOpened(template.lastOpened)}</p>

                {/* Buttons */}
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => navigate("/template/" + template.templateId._id)}
                    // onClick={() => showPdf(template.filePath)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
