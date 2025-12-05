import React, { useEffect, useMemo, useState } from "react";
import { PDFDocument } from "pdf-lib";
import SignaturePad from "./SignaturePad";
import axios from "axios";
import { toast } from "react-toastify";
import api from "@/utils/api";
import useAuth from "@/hooks/useAuth";
import Modal from "react-modal";
import PlaceSign from "./PlaceSign";
import { PenTool, MapPin, CheckCircle } from 'lucide-react';

export default function SignPad({ request, setIsModalOpen }) {
  const [showPad, setShowPad] = useState(false);
  const [signature, setSignature] = useState(
    localStorage.getItem("savedSignature") ?? null
  );
  const [userData, setUserData] = useState(null);
  const [currentPdfVersion, setCurrentPdfVersion] = useState(null);
  const { accessToken } = useAuth();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);
  const [signaturePositions, setSignaturePositions] = useState([]);
  
  // Determine if current user can sign (show helpful message even when Apply is disabled)
  const signingStatus = useMemo(() => {
    if (!request || !Array.isArray(request.recipients) || !userData) return { canSign: true, message: '' };

    const recipient = request.recipients.find((item) => {
      const recipientUserId =
        item?.userId && item.userId._id
          ? item.userId._id.toString()
          : item?.userId
          ? String(item.userId)
          : null;
      return recipientUserId && recipientUserId === String(userData?._id ?? "");
    });

    if (!recipient) return { canSign: true, message: '' };
    if (recipient.signed) return { canSign: false, message: 'Already signed' };
    if (!recipient.order) return { canSign: true, message: '' };

    const previous = request.recipients.filter((r) => r.order && r.order < recipient.order);
    const firstUnsigned = previous.find((r) => !r.signed);
    if (firstUnsigned) {
      const uid = firstUnsigned.userId;
      const nameFromUid = uid
        ? (uid.first_name || uid.firstName || uid.name || uid.fullName
            ? `${uid.first_name || uid.firstName || uid.name || uid.fullName}`.trim()
            : uid.email || uid.username || null)
        : null;
      const displayName = nameFromUid || `Approver #${firstUnsigned.order}`;
      return { canSign: false, message: `Waiting for ${displayName} to sign first` };
    }

    return { canSign: true, message: '' };
  }, [request, userData]);

  // Check if request is past due date
  const isOverdue = useMemo(() => {
    if (!request || !request.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(request.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() < today.getTime();
  }, [request]);

  useEffect(() => {
    if (!accessToken) return;

    const loadUser = async () => {
      try {
        const { data } = await api.get("/api/auth/user-data", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (data.success) {
          setUserData(data.userData);
        } else {
          toast.error(data.message || "Failed to load user data");
        }
      } catch (error) {
        const msg =
          error?.response?.data?.message || error.message || "Error loading user";
        console.error(error);
        toast.error(msg);
      }
    };

    loadUser();
  }, [accessToken]);

  useEffect(() => {
    if (!request) return;

    if (Array.isArray(request.pdfVersions) && request.pdfVersions.length > 0) {
      const [latestVersion] = [...request.pdfVersions].sort(
        (a, b) => b.version - a.version
      );
      setCurrentPdfVersion(latestVersion);
    } else if (request.templateId?.filePath) {
      setCurrentPdfVersion({ filePath: request.templateId.filePath });
    } else {
      setCurrentPdfVersion(null);
    }
  }, [request]);

  useEffect(() => {
    if (!request || !userData) return;

    const recipient = Array.isArray(request.recipients)
      ? request.recipients.find((item) => {
          const recipientUserId =
            item?.userId && item.userId._id
              ? item.userId._id.toString()
              : item?.userId
              ? String(item.userId)
              : null;
          return (
            recipientUserId &&
            recipientUserId === String(userData?._id ?? "")
          );
        })
      : null;

    if (recipient && Array.isArray(recipient.signaturePositions)) {
      setSignaturePositions(recipient.signaturePositions.map((position) => ({ ...position })));
    } else {
      setSignaturePositions([]);
    }
  }, [request, userData]);

  const pdfSource = useMemo(() => {
    if (!backendUrl || !currentPdfVersion?.filePath) return null;
    return `${backendUrl}/files/${currentPdfVersion.filePath}`;
  }, [backendUrl, currentPdfVersion]);

  const handleSaveSignature = (signatureDataUrl) => {
    setSignature(signatureDataUrl);
    setShowPad(false);
    localStorage.setItem("savedSignature", signatureDataUrl);
  };

  const addSignatureToPDF = async () => {
    if (!signature) {
      toast.error("No signature found. Please draw or upload your signature first.");
      return;
    }

    if (!request?.templateId?.filePath) {
      toast.error("Invalid request data.");
      return;
    }

    if (!userData?._id) {
      toast.error("User data not available. Please try again.");
      return;
    }

    if (!backendUrl) {
      toast.error("Backend is not configured.");
      return;
    }

    if (!currentPdfVersion?.filePath) {
      toast.error("No PDF available to sign.");
      return;
    }

    const recipient = Array.isArray(request.recipients)
      ? request.recipients.find((item) => {
          const recipientUserId =
            item?.userId && item.userId._id
              ? item.userId._id.toString()
              : item?.userId
              ? String(item.userId)
              : null;
          return (
            recipientUserId &&
            recipientUserId === String(userData._id)
          );
        })
      : null;

    if (!recipient) {
      toast.error("You are not authorized to sign this request.");
      return;
    }

    // Check if user has already signed
    if (recipient.signed) {
      toast.error("You have already signed this document.");
      return;
    }

    const positionsToUse = signaturePositions.length
      ? signaturePositions
      : Array.isArray(recipient.signaturePositions)
      ? recipient.signaturePositions
      : [];

    if (!positionsToUse.length) {
      toast.error('No signature positions defined. Use "Set signature positions" first to place your signature areas.');
      return;
    }

    try {
      const response = await fetch(
        `${backendUrl}/files/${currentPdfVersion.filePath}`
      );

      if (!response.ok) {
        toast.error("Unable to load the PDF to sign.");
        return;
      }

      const pdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const sigImage = await pdfDoc.embedPng(signature);
      const pages = pdfDoc.getPages();

      let applied = false;

      // Apply each placement; supports both legacy absolute coordinates and new ratio-based data.
      positionsToUse.forEach(({ page, x, y, width, height }) => {
        if (!page || !pages[page - 1]) return;

        const pdfPage = pages[Math.max(0, page - 1)];
        const pdfWidth = pdfPage.getWidth();
        const pdfHeight = pdfPage.getHeight();

        const xIsRatio = typeof x === 'number' && x >= 0 && x <= 1;
        const yIsRatio = typeof y === 'number' && y >= 0 && y <= 1;
        const widthIsRatio = typeof width === 'number' && width > 0 && width <= 1;
        const heightIsRatio = typeof height === 'number' && height > 0 && height <= 1;

        const drawWidth = widthIsRatio
          ? width * pdfWidth
          : width && width > 0
            ? width
            : 150;
        const drawHeight = heightIsRatio
          ? height * pdfHeight
          : height && height > 0
            ? height
            : 60;

        const absoluteX = xIsRatio ? x * pdfWidth : x;
        const absoluteYTop = yIsRatio ? y * pdfHeight : y;

        if (typeof absoluteX !== 'number' || typeof absoluteYTop !== 'number') {
          return;
        }

        const clampedX = Math.min(Math.max(absoluteX, 0), Math.max(pdfWidth - drawWidth, 0));
        const clampedYTop = Math.min(Math.max(absoluteYTop, 0), Math.max(pdfHeight - drawHeight, 0));
        const yFromBottom = pdfHeight - clampedYTop - drawHeight;

        pdfPage.drawImage(sigImage, {
          x: clampedX,
          y: yFromBottom,
          width: drawWidth,
          height: drawHeight,
        });
        applied = true;
      });

      if (!applied) {
        toast.error("No signature was applied. Please verify the positions.");
        return;
      }

      const signedPdfBytes = await pdfDoc.save();
      const signedPdfBlob = new Blob([signedPdfBytes], {
        type: "application/pdf",
      });

      const formData = new FormData();
      formData.append("pdf", signedPdfBlob, "signed-document.pdf");
      formData.append("requestId", request._id);
      formData.append("userId", userData._id);

      const { data } = await axios.post(
        `${backendUrl}/api/auth/signed-by-user`,
        formData,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        setIsModalOpen(false);
        setTimeout(() => window.location.reload(), 700);
      } else {
        // Enhanced error handling for sequential signing violations
        if (data.requiresSequentialSigning) {
          toast.error(data.message, {
            autoClose: false,
            closeButton: true,
            style: {
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              border: '2px solid #dc2626',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '500',
            },
          });
        } else {
          toast.error(data.message || "Failed to save signature");
        }
      }
    } catch (error) {
      console.error("Error signing PDF:", error);
      toast.error("Failed to sign PDF.");
    }
  };

  return (
    <div className="space-y-6 relative z-[10000]">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <PenTool size={18} />
          Signing Process
        </h3>
        <p className="text-sm text-blue-700 mb-2">
          Follow these steps to sign the document:
        </p>
        <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
          <li>First, set your signature positions on the document</li>
          <li>Draw or create your signature</li>
          <li>Apply your signature to all marked positions</li>
        </ol>
      </div>

      {/* Show overdue warning if applicable */}
      {isOverdue && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
            ⏰ Overdue Notice
          </h3>
          <p className="text-sm text-red-700">
            This document was due on <strong>{new Date(request.dueDate).toLocaleDateString()}</strong> and is now overdue. 
            Please complete your signature as soon as possible.
          </p>
        </div>
      )}

      {/* Show an inline blocking message under the action buttons so users see why Apply does nothing */}
      {!signingStatus.canSign && signingStatus.message && (
        <div className="mt-2">
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded">
            {signingStatus.message}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-[10000]">
        <button
          onClick={() => {
            console.log('Set Signature Positions button clicked');
            setIsPlacementModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors duration-200 relative z-[10000] cursor-pointer"
          type="button"
          style={{ 
            position: 'relative', 
            zIndex: 10000,
            pointerEvents: 'all'
          }}
        >
          <MapPin size={18} />
          <span>Set Signature Positions</span>
          {signaturePositions.length > 0 && (
            <span className="bg-purple-700 text-white text-xs px-2 py-1 rounded-full">
              {signaturePositions.length}
            </span>
          )}
        </button>
        
        <button
          onClick={() => {
            console.log('Draw Signature button clicked');
            setShowPad(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 relative z-[10000] cursor-pointer"
          type="button"
          style={{ 
            position: 'relative', 
            zIndex: 10000,
            pointerEvents: 'all'
          }}
        >
          <PenTool size={18} />
          <span>Draw Signature</span>
          {signature && <CheckCircle size={16} className="text-green-300" />}
        </button>
        
        <button
          onClick={addSignatureToPDF}
          disabled={!signature || !signaturePositions.length}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200 relative z-[10000] cursor-pointer"
          type="button"
          style={{ 
            position: 'relative', 
            zIndex: 10000,
            pointerEvents: signature && signaturePositions.length ? 'all' : 'none'
          }}
        >
          <CheckCircle size={18} />
          <span>Apply Signature</span>
        </button>
      </div>

      {signaturePositions.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            {signaturePositions.length} signature position{signaturePositions.length !== 1 ? 's' : ''} set. 
            Your signature will be applied to all marked areas.
          </p>
        </div>
      )}

      {showPad && (
        <SignaturePad
          onSave={handleSaveSignature}
          onClose={() => setShowPad(false)}
        />
      )}

      {signature && (
        <div className="mt-4">
          <img src={signature} alt="User signature" className="max-h-40" />
        </div>
      )}

      <Modal
        isOpen={isPlacementModalOpen}
        onRequestClose={() => setIsPlacementModalOpen(false)}
        contentLabel="Set Signature Positions"
        className="p-5 mt-12 bg-white rounded-lg shadow-lg max-w-5xl mx-auto relative z-[10001]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]"
        style={{
          overlay: {
            zIndex: 10000,
          },
          content: {
            zIndex: 10001,
          }
        }}
      >
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <MapPin size={20} />
            Set Signature Positions
          </h2>
          <p className="text-sm text-gray-600">
            Click anywhere on the PDF to create signature areas. You can create multiple positions 
            for multiple signatures on the same document.
          </p>
        </div>
        {pdfSource ? (
          <PlaceSign
            pdfFile={pdfSource}
            signatures={signaturePositions}
            setSignatures={setSignaturePositions}
          />
        ) : (
          <p className="text-sm text-red-600">
            Preview unavailable. Please ensure the PDF is accessible.
          </p>
        )}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              type="button"
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              onClick={() => setSignaturePositions([])}
            >
              Clear All Positions
            </button>
            {signaturePositions.length > 0 && (
              <span className="px-3 py-2 bg-green-100 text-green-700 rounded text-sm flex items-center gap-2">
                <CheckCircle size={16} />
                {signaturePositions.length} position{signaturePositions.length !== 1 ? 's' : ''} set
              </span>
            )}
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            onClick={() => setIsPlacementModalOpen(false)}
          >
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
}
