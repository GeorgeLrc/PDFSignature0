import React, { useContext, useEffect } from "react";
import { AppContext } from "../context-api/AppContext";
import { useNavigate } from "react-router-dom";
import api from '@/utils/api';
import useAuth from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function Request() {
  const { myRequests, getMyRequests, requestsByOthers, getRequestsByOthers } =
    useContext(AppContext);

  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const handleCancel = async (requestId) => {
    const ok = window.confirm('Cancel/delete this request? This cannot be undone.');
    if (!ok) return;
    try {
      const { data } = await api.post('/api/auth/delete-request', { requestId }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (data && data.success) {
        toast.success(data.message || 'Request cancelled');
      } else {
        toast.error(data.message || 'Failed to cancel');
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Network error');
    }
    // refresh lists
    getMyRequests();
    getRequestsByOthers();
  }

  const checkFinishedSignedCount = (recipients) => {
    if (!Array.isArray(recipients)) return [];
    return recipients.filter((recipient) => recipient.signed === true);
  };

  const getSignedPercent = (completed, total) => {
    if (!total || total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getPercentColor = (percent) => {
    if (percent <= 33) return 'text-red-600';
    if (percent <= 66) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressBarColor = (percent) => {
    if (percent <= 33) return 'bg-red-500';
    if (percent <= 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  useEffect(() => {
    getMyRequests();
    getRequestsByOthers();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* My Requests Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">My Requests</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border text-center">No</th>
                <th className="p-3 border text-left">Title</th>
                <th className="p-3 border text-left">Approvers</th>
                <th className="p-3 border text-center">Step</th>
                <th className="p-3 border text-center">Date</th>
                <th className="p-3 border text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {myRequests && myRequests.length > 0 ? (
                myRequests.map((request, index) => (
                  <tr key={index} className="border">
                    <td className="p-3 border text-center">{index + 1}</td>
                    <td className="p-3 border text-left">{request.title}</td>
                    <td className="p-3 border text-left">
                      {request.recipients.map((recipient, index) => (
                        <span key={index} className="text-blue-500">
                          {recipient.userId.first_name} {recipient.userId.last_name}
                          {index !== request.recipients.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </td>
                    {/* need to update data */}
                    <td className="p-3 border text-center">
                      {(() => {
                        const completed = request.recipients ? checkFinishedSignedCount(request.recipients).length : 0;
                        const total = request.recipients ? request.recipients.length : 0;
                        const percent = getSignedPercent(completed, total);
                        return (
                          <div className="flex items-center justify-center gap-2">
                            <span>{completed}/{total}</span>
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${getProgressBarColor(percent)} transition-all duration-300`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className={`font-semibold ${getPercentColor(percent)}`}>
                              {percent}%
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-3 border text-center">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 border text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-white ${request.status === "pending"
                          ? "bg-yellow-500"
                          : request.status === "approved"
                            ? "bg-green-500"
                            : "bg-red-500"
                          }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="p-3 border text-center">
                      <button onClick={() => handleCancel(request._id)} className="px-2 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600">Cancel</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-3 text-center text-gray-500">
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Requests By Others Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Requests By Others</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border text-center">No</th>
                <th className="p-3 border text-left">Title</th>
                <th className="p-3 border text-left">Sender</th>
                <th className="p-3 border text-center">Date</th>
                <th className="p-3 border text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {requestsByOthers && requestsByOthers.length > 0 ? (
                requestsByOthers.map((request, index) => (
                  <tr key={index} className="border">
                    <td className="p-3 border text-center">{index + 1}</td>
                    <td className="p-3 border text-left">{request.title}</td>
                    <td className="p-3 border text-left">
                      {request.senderId.first_name} {request.senderId.last_name}
                    </td>
                    <td className="p-3 border text-center">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 border text-center">
                      <button onClick={() => navigate(`/sign-pdf/${request._id}`)} className="border border-black px-2 hover:bg-blue-400"> sign </button>
                    </td>
                    
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-3 text-center text-gray-500">
                    No received requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
