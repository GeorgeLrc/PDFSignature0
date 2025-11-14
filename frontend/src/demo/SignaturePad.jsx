import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

// eslint-disable-next-line react/prop-types
export default function SignaturePad({ onSave, onClose }) {
//   const sigCanvas = useRef(null);
    const [signature,setSignature] = useState(null);

  const handleSave = () => {
    if(!signature) return;
    const canvas = signature.getCanvas();
    const signatureDataUrl = canvas.toDataURL("image/png");
    onSave(signatureDataUrl);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
      <div className="bg-white p-4 rounded-md shadow-lg">
        <h2 className="text-lg font-bold mb-2">Sign Below</h2>
        <SignatureCanvas
          ref={(ref)=> setSignature(ref)}
          penColor="black"
          canvasProps={{ className: "border border-gray-300 w-[300px] h-[150px]" }}
        />
        <div className="mt-2 flex justify-between">
          <button onClick={() => signature.clear()} className="px-4 py-1 bg-red-500 text-white rounded">Clear</button>
          <button onClick={handleSave} className="px-4 py-1 bg-green-500 text-white rounded">Save</button>
          <button onClick={onClose} className="px-4 py-1 bg-gray-500 text-white rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}
