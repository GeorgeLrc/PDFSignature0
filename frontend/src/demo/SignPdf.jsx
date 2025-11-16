import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PdfViewer from './PdfViewer';
import Modal from 'react-modal';
import SignPad from './SignPad';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import useAuth from '@/hooks/useAuth';
import { PenTool } from 'lucide-react';

// Optional: do this in your app root once
// Modal.setAppElement('#root');

export default function SignPdf() {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestById, setRequestById] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const getRequestById = async (reqId, token) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/api/auth/requests/${reqId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setRequestById(data.request);
      } else {
        setError(data.message || 'Failed to load request');
        toast.error(data.message || 'Failed to load request');
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Error loading request';
      console.error(error);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && accessToken) {
      getRequestById(id, accessToken);
    }
  }, [id, accessToken]);

  const handleSignClick = () => {
    console.log('Sign button clicked - attempting to open modal');
    console.log('Current modal state:', isModalOpen);
    setIsModalOpen(true);
    console.log('Modal state after setting to true:', true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading request...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!requestById || !requestById.templateId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Request not found or invalid</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const buildFileUrl = (path) => (backendUrl && path ? `${backendUrl}/files/${path}` : null);
  const templateFileUrl = buildFileUrl(requestById.templateId.filePath);

  return (
    <div className="relative z-40">
      <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow relative z-50">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-200 relative z-50"
          title="Go back"
        >
          ← Back
        </button>
        
        <div className="flex gap-3">
          <span className="text-sm text-gray-600 px-3 py-2 bg-gray-50 rounded">
            Request ID: {id}
          </span>
          <button
            onClick={handleSignClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-lg transition-all duration-200 transform hover:scale-105 relative z-50 cursor-pointer"
            title="Open signing modal"
            type="button"
            style={{ 
              position: 'relative', 
              zIndex: 9999,
              pointerEvents: 'all'
            }}
            onMouseEnter={() => console.log('Button hovered')}
            onMouseDown={() => console.log('Button pressed down')}
            onMouseUp={() => console.log('Button pressed up')}
          >
            <PenTool size={18} />
            <span>Sign Here</span>
          </button>
        </div>
      </div>

      <div className="relative z-30">
        {templateFileUrl ? (
          <PdfViewer pdfFile={templateFileUrl} />
        ) : (
          <p className="mt-4 text-sm text-red-600">Template file is unavailable. Please verify the backend URL configuration.</p>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Sign PDF"
        className="bg-white p-5 rounded-lg shadow-lg mt-20 relative z-[9999]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998]"
        style={{
          overlay: {
            zIndex: 9998,
          },
          content: {
            zIndex: 9999,
          }
        }}
      >
        <SignPad request={requestById} setIsModalOpen={setIsModalOpen} />
      </Modal>

      {Array.isArray(requestById.pdfVersions) &&
        requestById.pdfVersions.map((pdf, index) => (
          <div key={index}>
            <h2>Version - {pdf.version}</h2>
            <p>
              Signed By -{' '}
              {pdf?.signedBy?.userId
                ? `${pdf.signedBy.userId.first_name} ${pdf.signedBy.userId.last_name}`
                : '—'}
            </p>
            {buildFileUrl(pdf.filePath) ? (
              <iframe
                src={buildFileUrl(pdf.filePath)}
                width="100%"
                height="1200"
                style={{ border: 'none' }}
                title={`pdf-version-${pdf.version}`}
              />
            ) : (
              <p className="text-sm text-gray-500">Signed PDF version unavailable.</p>
            )}
          </div>
        ))}
    </div>
  );
}
