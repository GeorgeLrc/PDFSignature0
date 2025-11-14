import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PdfViewer from './PdfViewer';
import Modal from 'react-modal';
import SignPad from './SignPad';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import useAuth from '@/hooks/useAuth';

// Optional: do this in your app root once
// Modal.setAppElement('#root');

export default function SignPdf() {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestById, setRequestById] = useState(null);
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const getRequestById = async (reqId, token) => {
    try {
      const { data } = await api.get(`/api/auth/requests/${reqId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setRequestById(data.request);
      } else {
        toast.error(data.message || 'Failed to load request');
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Error loading request';
      console.error(error);
      toast.error(msg);
    }
  };

  useEffect(() => {
    if (id && accessToken) getRequestById(id, accessToken);
  }, [id, accessToken]);

  if (!requestById || !requestById.templateId) {
    return <p>Loading...</p>;
  }

  const buildFileUrl = (path) => (backendUrl && path ? `${backendUrl}/files/${path}` : null);
  const templateFileUrl = buildFileUrl(requestById.templateId.filePath);

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1 bg-gray-100 rounded-md text-sm"
          title="Go back"
        >
          ← Back
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm"
          title="Open signing modal"
        >
          <span>Sign here</span>
        </button>
      </div>

      <div>
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
        className="bg-white p-5 rounded-lg shadow-lg mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
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
