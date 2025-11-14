import React, { useEffect, useMemo, useState } from "react";
import { PDFDocument } from "pdf-lib";
import SignaturePad from "./SignaturePad";
import axios from "axios";
import { toast } from "react-toastify";
import api from "@/utils/api";
import useAuth from "@/hooks/useAuth";
import Modal from "react-modal";
import PlaceSign from "./PlaceSign";

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

    const positionsToUse = signaturePositions.length
      ? signaturePositions
      : Array.isArray(recipient.signaturePositions)
      ? recipient.signaturePositions
      : [];

    if (!positionsToUse.length) {
      toast.error('No signature positions defined. Use "Set signature positions" before applying.');
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
        toast.error(data.message || "Failed to save signature");
      }
    } catch (error) {
      console.error("Error signing PDF:", error);
      toast.error("Failed to sign PDF.");
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <button
          onClick={() => setShowPad(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
          type="button"
        >
          Draw Signature
        </button>
        <button
          onClick={() => setIsPlacementModalOpen(true)}
          className="px-4 py-2 bg-indigo-500 text-white rounded"
          type="button"
        >
          Set Signature Positions
        </button>
        <button
          onClick={addSignatureToPDF}
          className="px-4 py-2 bg-green-500 text-white"
          type="button"
        >
          Apply Signature
        </button>
      </div>

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
        className="p-5 mt-12 bg-white rounded-lg shadow-lg max-w-5xl mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-semibold mb-4">Set Signature Positions</h2>
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
        <div className="mt-4 flex justify-between">
          <button
            type="button"
            className="px-3 py-2 bg-gray-100 rounded"
            onClick={() => setSignaturePositions([])}
          >
            Clear Positions
          </button>
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
