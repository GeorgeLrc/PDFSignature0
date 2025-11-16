import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import { ChevronLeft, ChevronRight, PenTool } from "lucide-react";

const MIN_WIDTH_RATIO = 0.05;
const MAX_WIDTH_RATIO = 0.6;
const MIN_HEIGHT_RATIO = 0.05;
const MAX_HEIGHT_RATIO = 0.4;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const normalizeDimension = (value, dimension, min, max) => {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  const base = value > 1 && dimension ? value / dimension : value;
  return clamp(base, min, max);
};

const normalizePosition = (value, dimension) => {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  const base = value > 1 && dimension ? value / dimension : value;
  return clamp(base, 0, 1);
};

function PlaceSign({ pdfFile, signatures, setSignatures }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [renderedSizes, setRenderedSizes] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(null);
  const pageWrapperRef = useRef(null);

  useEffect(() => {
    if (selectedIndex === null) return;
    if (selectedIndex < 0 || selectedIndex >= signatures.length) {
      setSelectedIndex(null);
    }
  }, [selectedIndex, signatures.length]);

  const currentRenderedSize = useMemo(
    () => renderedSizes[pageNumber] ?? null,
    [renderedSizes, pageNumber]
  );

  const normalizedPositions = useMemo(() => {
    const size = currentRenderedSize;
    if (!size) return [];

    return signatures
      .map((sig, index) => ({ sig, index }))
      .filter(({ sig }) => sig.page === pageNumber)
      .map(({ sig, index }) => {
        const hasRatios = typeof sig.x === "number" && sig.x >= 0 && sig.x <= 1;
        const hasHeightRatios = typeof sig.y === "number" && sig.y >= 0 && sig.y <= 1;
        const xRatio = hasRatios ? sig.x : Math.min(Math.max(sig.x / size.width, 0), 1);
        const yRatio = hasHeightRatios ? sig.y : Math.min(Math.max(sig.y / size.height, 0), 1);

        const widthRatio = (() => {
          if (typeof sig.width === "number" && sig.width > 0) {
            return sig.width <= 1
              ? Math.min(Math.max(sig.width, MIN_WIDTH_RATIO), MAX_WIDTH_RATIO)
              : Math.min(Math.max(sig.width / size.width, MIN_WIDTH_RATIO), MAX_WIDTH_RATIO);
          }
          return Math.min(Math.max(150 / size.width, MIN_WIDTH_RATIO), MAX_WIDTH_RATIO);
        })();

        const heightRatio = (() => {
          if (typeof sig.height === "number" && sig.height > 0) {
            return sig.height <= 1
              ? Math.min(Math.max(sig.height, MIN_HEIGHT_RATIO), MAX_HEIGHT_RATIO)
              : Math.min(Math.max(sig.height / size.height, MIN_HEIGHT_RATIO), MAX_HEIGHT_RATIO);
          }
          return Math.min(Math.max(60 / size.height, MIN_HEIGHT_RATIO), MAX_HEIGHT_RATIO);
        })();

        return {
          index,
          x: Math.min(Math.max(xRatio, 0), 1 - widthRatio),
          y: Math.min(Math.max(yRatio, 0), 1 - heightRatio),
          width: widthRatio,
          height: heightRatio,
        };
      });
  }, [currentRenderedSize, pageNumber, signatures]);

  const selectedSignature = useMemo(
    () => (selectedIndex !== null ? signatures[selectedIndex] ?? null : null),
    [selectedIndex, signatures]
  );

  const selectedNormalized = useMemo(
    () =>
      selectedIndex === null
        ? null
        : normalizedPositions.find(({ index }) => index === selectedIndex) ?? null,
    [normalizedPositions, selectedIndex]
  );

  const updateSignature = useCallback(
    (index, updates) => {
      setSignatures((prev) =>
        prev.map((sig, idx) => {
          if (idx !== index) return sig;

          const next = { ...sig };
          const widthDimension = currentRenderedSize?.width ?? null;
          const heightDimension = currentRenderedSize?.height ?? null;

          if (Object.prototype.hasOwnProperty.call(updates, "page")) {
            next.page = updates.page;
          }

          if (Object.prototype.hasOwnProperty.call(updates, "width")) {
            const widthRatio = normalizeDimension(
              updates.width,
              widthDimension,
              MIN_WIDTH_RATIO,
              MAX_WIDTH_RATIO
            );
            if (widthRatio !== null) {
              next.width = widthRatio;
            }
          }

          if (Object.prototype.hasOwnProperty.call(updates, "height")) {
            const heightRatio = normalizeDimension(
              updates.height,
              heightDimension,
              MIN_HEIGHT_RATIO,
              MAX_HEIGHT_RATIO
            );
            if (heightRatio !== null) {
              next.height = heightRatio;
            }
          }

          if (Object.prototype.hasOwnProperty.call(updates, "x")) {
            const xRatio = normalizePosition(updates.x, widthDimension);
            if (xRatio !== null) {
              next.x = xRatio;
            }
          }

          if (Object.prototype.hasOwnProperty.call(updates, "y")) {
            const yRatio = normalizePosition(updates.y, heightDimension);
            if (yRatio !== null) {
              next.y = yRatio;
            }
          }

          const widthRatio = normalizeDimension(
            next.width,
            widthDimension,
            MIN_WIDTH_RATIO,
            MAX_WIDTH_RATIO
          );
          const heightRatio = normalizeDimension(
            next.height,
            heightDimension,
            MIN_HEIGHT_RATIO,
            MAX_HEIGHT_RATIO
          );

          const clampedWidth = clamp(
            widthRatio ?? MIN_WIDTH_RATIO,
            MIN_WIDTH_RATIO,
            MAX_WIDTH_RATIO
          );
          const clampedHeight = clamp(
            heightRatio ?? MIN_HEIGHT_RATIO,
            MIN_HEIGHT_RATIO,
            MAX_HEIGHT_RATIO
          );

          const maxX = 1 - clampedWidth;
          const maxY = 1 - clampedHeight;

          const normalizedX = normalizePosition(next.x, widthDimension);
          const normalizedY = normalizePosition(next.y, heightDimension);

          const clampedX = normalizedX !== null ? clamp(normalizedX, 0, maxX) : 0;
          const clampedY = normalizedY !== null ? clamp(normalizedY, 0, maxY) : 0;

          next.width = Number(clampedWidth.toFixed(4));
          next.height = Number(clampedHeight.toFixed(4));
          next.x = Number(clampedX.toFixed(4));
          next.y = Number(clampedY.toFixed(4));

          if (!next.page) {
            next.page = pageNumber;
          }

          return next;
        })
      );
    },
    [currentRenderedSize, pageNumber, setSignatures]
  );

  const handlePdfClick = useCallback(
    (event) => {
      const wrapper = pageWrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const width = currentRenderedSize?.width ?? rect.width;
      const height = currentRenderedSize?.height ?? rect.height;
      if (!width || !height) return;

      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      const defaultWidthPx = Math.min(width * 0.2, 160);
      const defaultHeightPx = Math.min(height * 0.12, 70);

      const widthRatio = Math.min(Math.max(defaultWidthPx / width, MIN_WIDTH_RATIO), MAX_WIDTH_RATIO);
      const heightRatio = Math.min(Math.max(defaultHeightPx / height, MIN_HEIGHT_RATIO), MAX_HEIGHT_RATIO);

      const xRatio = Math.min(
        Math.max((clickX - (widthRatio * width) / 2) / width, 0),
        1 - widthRatio
      );
      const yRatio = Math.min(
        Math.max((clickY - (heightRatio * height) / 2) / height, 0),
        1 - heightRatio
      );

      setSignatures((prev) => {
        const next = [
          ...prev,
          { page: pageNumber, x: xRatio, y: yRatio, width: widthRatio, height: heightRatio },
        ];
        setSelectedIndex(next.length - 1);
        return next;
      });
    },
    [currentRenderedSize, pageNumber, setSelectedIndex, setSignatures]
  );

  const handleSelectSignature = useCallback(
    (index) => {
      setSelectedIndex(index);
      const signature = signatures[index];
      if (signature?.page && signature.page !== pageNumber) {
        setPageNumber(signature.page);
      }
    },
    [pageNumber, setPageNumber, setSelectedIndex, signatures]
  );

  const selectedMaxX = selectedNormalized ? Math.max(1 - selectedNormalized.width, 0) : 1;
  const selectedMaxY = selectedNormalized ? Math.max(1 - selectedNormalized.height, 0) : 1;

  const handleRemoveSignature = useCallback(
    (indexToRemove) => {
      setSelectedIndex((prevSelected) => {
        if (prevSelected === null) return prevSelected;
        if (prevSelected === indexToRemove) return null;
        if (prevSelected > indexToRemove) return prevSelected - 1;
        return prevSelected;
      });
      setSignatures((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    },
    [setSelectedIndex, setSignatures]
  );

  const handlePageRenderSuccess = useCallback(() => {
    const wrapper = pageWrapperRef.current;
    if (!wrapper) return;
    const canvas = wrapper.querySelector("canvas");
    if (!canvas) return;

    setRenderedSizes((prev) => ({
      ...prev,
      [pageNumber]: {
        width: canvas.offsetWidth,
        height: canvas.offsetHeight,
      },
    }));
  }, [pageNumber]);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
  }, []);

  return (
    <div className="flex bg-gray-100 p-6">
      <div className="relative flex flex-col items-center bg-white shadow-lg rounded-lg p-4 w-full" style={{ maxHeight: "70vh", overflow: "auto" }}>
        <div
          ref={pageWrapperRef}
          onClick={handlePdfClick}
          className="relative inline-block cursor-crosshair"
        >
          <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
            <Page
              pageNumber={pageNumber}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={700}
              className="border border-gray-300 shadow-md rounded-md"
              onRenderSuccess={handlePageRenderSuccess}
            />
          </Document>

          {normalizedPositions.map(({ index, x, y, width, height }) => (
            <div
              key={`${pageNumber}-${index}`}
              className={`absolute rounded-md transition-all border-2 ${
                selectedIndex === index
                  ? "border-purple-600 bg-purple-500/20 ring-2 ring-purple-300"
                  : "border-orange-500 border-dashed bg-orange-500/10"
              }`}
              style={{
                left: `${x * 100}%`,
                top: `${y * 100}%`,
                width: `${width * 100}%`,
                height: `${height * 100}%`,
              }}
              onMouseDown={(event) => {
                event.stopPropagation();
                handleSelectSignature(index);
              }}
            >
              <button
                type="button"
                aria-label="Remove signature position"
                className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center shadow"
                onClick={(event) => {
                  event.stopPropagation();
                  handleRemoveSignature(index);
                }}
              >
                ×
              </button>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-red-500">+</span>
              </div>
              <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs font-semibold">
                <PenTool size={12} />
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-4 w-full">
          <button
            className={`p-2 rounded-full ${
              pageNumber <= 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-teal-500 hover:bg-teal-600 text-white"
            }`}
            onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
            disabled={pageNumber <= 1}
            type="button"
          >
            <ChevronLeft size={20} />
          </button>

          <p className="text-gray-700 text-lg">
            Page <span className="font-bold">{pageNumber}</span> of {" "}
            <span className="font-bold">{numPages ?? "-"}</span>
          </p>

          <button
            className={`p-2 rounded-full ${
              !numPages || pageNumber >= numPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-teal-500 hover:bg-teal-600 text-white"
            }`}
            onClick={() =>
              setPageNumber((prev) =>
                numPages ? Math.min(prev + 1, numPages) : prev
              )
            }
            disabled={!numPages || pageNumber >= numPages}
            type="button"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="w-1/4 bg-white shadow-lg rounded-lg p-4 ml-4 overflow-y-auto max-h-[70vh]">
        <h3 className="text-center font-bold mb-3">Signature Boxes</h3>
        {signatures.length ? (
          <ul className="space-y-2 mb-4">
            {signatures.map((sig, idx) => (
              <li key={`sig-${idx}`}>
                <button
                  type="button"
                  className={`w-full rounded border px-3 py-2 text-left text-sm transition ${
                    selectedIndex === idx
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                  onClick={() => handleSelectSignature(idx)}
                >
                  Box {idx + 1} · Page {sig.page ?? "-"}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-xs text-gray-500">
            Click anywhere on the PDF to place your first signature box.
          </p>
        )}

        {selectedNormalized && selectedIndex !== null ? (
          <div className="mb-5 rounded-lg border border-purple-200 bg-purple-50/60 p-3">
            <h4 className="text-sm font-semibold text-purple-700 mb-3">Adjust Selected Box</h4>
            <p className="text-xs text-purple-600 mb-3">
              Page {selectedSignature?.page ?? pageNumber}
            </p>

            <label className="block text-xs font-semibold text-slate-600">
              Width ({Math.round(selectedNormalized.width * 100)}%)
              <input
                type="range"
                min={MIN_WIDTH_RATIO}
                max={MAX_WIDTH_RATIO}
                step="0.01"
                value={selectedNormalized.width}
                onChange={(event) => {
                  if (selectedIndex === null) return;
                  updateSignature(selectedIndex, {
                    width: parseFloat(event.target.value),
                  });
                }}
                className="mt-1 w-full accent-purple-600"
              />
            </label>

            <label className="mt-3 block text-xs font-semibold text-slate-600">
              Height ({Math.round(selectedNormalized.height * 100)}%)
              <input
                type="range"
                min={MIN_HEIGHT_RATIO}
                max={MAX_HEIGHT_RATIO}
                step="0.01"
                value={selectedNormalized.height}
                onChange={(event) => {
                  if (selectedIndex === null) return;
                  updateSignature(selectedIndex, {
                    height: parseFloat(event.target.value),
                  });
                }}
                className="mt-1 w-full accent-purple-600"
              />
            </label>

            <label className="mt-3 block text-xs font-semibold text-slate-600">
              Left Offset ({Math.round(selectedNormalized.x * 100)}%)
              <input
                type="range"
                min={0}
                max={Math.max(selectedMaxX, 0)}
                step="0.01"
                value={Math.min(selectedNormalized.x, Math.max(selectedMaxX, 0))}
                onChange={(event) => {
                  if (selectedIndex === null) return;
                  updateSignature(selectedIndex, {
                    x: parseFloat(event.target.value),
                  });
                }}
                className="mt-1 w-full accent-purple-600"
              />
            </label>

            <label className="mt-3 block text-xs font-semibold text-slate-600">
              Top Offset ({Math.round(selectedNormalized.y * 100)}%)
              <input
                type="range"
                min={0}
                max={Math.max(selectedMaxY, 0)}
                step="0.01"
                value={Math.min(selectedNormalized.y, Math.max(selectedMaxY, 0))}
                onChange={(event) => {
                  if (selectedIndex === null) return;
                  updateSignature(selectedIndex, {
                    y: parseFloat(event.target.value),
                  });
                }}
                className="mt-1 w-full accent-purple-600"
              />
            </label>
          </div>
        ) : (
          <div className="mb-5 rounded-lg border border-dashed border-gray-300 p-3 text-xs text-gray-500">
            Select a signature box to fine-tune its size and position.
          </div>
        )}

        <h3 className="text-center font-bold mb-2 border-t border-gray-200 pt-3">Pages</h3>
        {Array.from(new Array(numPages || 0), (_, index) => (
          <div
            key={`thumb-${index}`}
            className={`cursor-pointer mb-2 p-1 border rounded ${
              pageNumber === index + 1 ? "border-purple-500" : "border-gray-300"
            }`}
            onClick={() => setPageNumber(index + 1)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                setPageNumber(index + 1);
              }
            }}
          >
            <Document file={pdfFile}>
              <Page
                pageNumber={index + 1}
                width={100}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            </Document>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlaceSign;
