import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight } from "lucide-react";


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();


function PdfViewer({ pdfFile }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [docError, setDocError] = useState(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setPageNumber((p) => Math.min(Math.max(1, p), numPages));
  }, []);

  const goPrev = () => setPageNumber((p) => Math.max(p - 1, 1));
  const goNext = () => setPageNumber((p) => Math.min(p + 1, numPages || 1));

  return (
    <div className="flex bg-gray-100 min-h-screen p-6 gap-4 relative">
      {/* Main viewer */}
      <div className="flex flex-col items-center bg-white shadow-lg rounded-lg p-4 w-4/5 relative z-10">
        <Document
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => setDocError(err?.message || String(err))}
          loading={<div className="p-6 text-gray-600">Loading PDF…</div>}
          error={
            <div className="p-6 text-red-600">
              Failed to load PDF{docError ? `: ${docError}` : ""}.
            </div>
          }
        >
          {numPages ? (
            <Page
              pageNumber={pageNumber}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="border border-gray-300 shadow-md rounded-md"
            />
          ) : null}
        </Document>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 w-full">
          <button
            className={`p-2 rounded-full ${
              pageNumber <= 1 || !numPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            onClick={goPrev}
            disabled={pageNumber <= 1 || !numPages}
            aria-label="Previous page"
            type="button"
          >
            <ChevronLeft size={20} />
          </button>

          <p className="text-gray-700 text-lg">
            Page <span className="font-bold">{numPages ? pageNumber : "-"}</span>{" "}
            of <span className="font-bold">{numPages ?? "-"}</span>
          </p>

          <button
            className={`p-2 rounded-full ${
              !numPages || pageNumber >= numPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            onClick={goNext}
            disabled={!numPages || pageNumber >= numPages}
            aria-label="Next page"
            type="button"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Thumbnails (same Document instance, no re-parse) */}
      <div className="w-1/5 bg-white shadow-lg rounded-lg p-4 overflow-y-auto max-h-[80vh]">
        <h3 className="text-center font-bold mb-2">Pages</h3>
        {numPages ? (
          <Document file={pdfFile} loading={null} error={null}>
            <div className="space-y-2">
              {Array.from({ length: numPages }, (_, i) => {
                const n = i + 1;
                return (
                  <button
                    key={n}
                    onClick={() => setPageNumber(n)}
                    className={`block w-full text-left p-1 border rounded ${
                      pageNumber === n ? "border-blue-500" : "border-gray-300"
                    }`}
                    type="button"
                  >
                    <Page
                      pageNumber={n}
                      width={100}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </button>
                );
              })}
            </div>
          </Document>
        ) : (
          <div className="text-sm text-gray-500">No pages yet.</div>
        )}
      </div>
    </div>
  );
}

export default PdfViewer;

