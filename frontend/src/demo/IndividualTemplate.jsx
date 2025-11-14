import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PdfViewer from './PdfViewer';
import SignPad from './SignPad';
import api from "@/utils/api";
import toast from "react-hot-toast";
import useAuth from '@/hooks/useAuth';

export default function IndividualTemplate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [templateById,setTemplateById] = useState(null);
  const { accessToken } = useAuth();

  // const { templateById, getTemplateById } = useContext(AppContext)

  const getTemplateById = async (id, token) => {
    try {
        let { data } = await api.get(`/api/auth/templates/${id}`, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          });

        if(data.success === true) {
            console.log(data);
            setTemplateById(data.template);
        }
        
            
    } catch (error) {
        console.log(error);
        toast.error(error);
    }
  }

  useEffect(() => {
    getTemplateById(id,accessToken);
  }, [id,accessToken])

  if(!templateById) {
    return "No template with this id."
  }

  const fileUrl = templateById.filePath ? `${import.meta.env.VITE_BACKEND_URL}/files/${templateById.filePath}` : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{templateById.title}</h1>
          <div className="text-sm text-gray-500 mt-1">{templateById.isPublic ? 'Public template' : 'Private template'}</div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => {
              if (!templateById.filePath) return;
              // if (!confirm('Start a new request using this template?')) return;
              navigate('/create-request', { state: { templateId: id, filePath: templateById.filePath } });
            }}
            disabled={!templateById.filePath}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 disabled:opacity-60 hover:bg-blue-700 text-white rounded-md shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M10 2a2 2 0 00-2 2v6H5a2 2 0 000 4h3v2a2 2 0 004 0v-2h3a2 2 0 000-4h-3V4a2 2 0 00-2-2z" />
            </svg>
            <span>Use this template</span>
          </button>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md shadow-sm"
            title="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0L3.586 10l4.707-4.707a1 1 0 011.414 1.414L6.414 10l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Back</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          {fileUrl ? (
            <>
              <PdfViewer pdfFile={fileUrl} />

              <div className="mt-4">
                <iframe
                  src={`${fileUrl}#toolbar=1&navpanes=0`}
                  width="100%"
                  height="800px"
                  style={{ border: "none" }}
                  title="Template preview"
                ></iframe>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-slate-500">No file available for this template.</div>
          )}

          {/* Buttons moved to header */}
        </div>
      </div>
    </div>
  );
}
