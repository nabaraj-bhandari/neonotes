import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "../styles/markdown.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function NoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/notes/${id}`);
        setNote(res.data);
      } catch (err) {
        toast.error("Failed to fetch note");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!note) return null;

  return (
    <article className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 py-4 sm:py-6">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="text-gray-400 hover:text-gray-300 flex items-center gap-2 -ml-1"
      >
        ← Back to Notes
      </button>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-100 break-words">
        {note.title}
      </h1>

      {/* Metadata */}
      <div className="text-sm text-gray-500">
        Created: {new Date(note.createdAt).toLocaleDateString()}
      </div>

      {/* Content */}
      <div data-color-mode="dark">
        <div className="wmde-markdown-var">
          <div className="wmde-markdown bg-gray-800 rounded-lg p-3 sm:p-6">
            <div className="wmde-markdown-color markdown-content prose-sm sm:prose-base">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[[rehypeKatex, { strict: false }], rehypeRaw]}
                components={{
                  img: ({ node, ...props }) => (
                    <img
                      {...props}
                      className="wmde-markdown-image max-w-full rounded-lg"
                      alt={props.alt || "Note image"}
                      loading="lazy"
                    />
                  ),
                  code: ({ node, inline, className, children, ...props }) => (
                    <code
                      className={`${className || ""} ${
                        inline
                          ? "wmde-markdown-inline-code"
                          : "wmde-markdown-code"
                      }`}
                      {...props}
                    >
                      {children}
                    </code>
                  ),
                  pre: ({ node, children, ...props }) => (
                    <pre className="wmde-markdown-pre" {...props}>
                      {children}
                    </pre>
                  ),
                  table: ({ node, children, ...props }) => (
                    <div className="wmde-markdown-table-wrapper">
                      <table className="wmde-markdown-table" {...props}>
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ node, children, ...props }) => (
                    <th className="wmde-markdown-th" {...props}>
                      {children}
                    </th>
                  ),
                  td: ({ node, children, ...props }) => (
                    <td className="wmde-markdown-td" {...props}>
                      {children}
                    </td>
                  ),
                  p: ({ node, children, ...props }) => (
                    <p className="wmde-markdown-p" {...props}>
                      {children}
                    </p>
                  ),
                  blockquote: ({ node, children, ...props }) => (
                    <blockquote className="wmde-markdown-blockquote" {...props}>
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {note.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* PDF attachments */}

      {Array.isArray(note?.pdfs) && note.pdfs.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-3 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-100">
              Attachments ({note.pdfs.length})
            </h2>
          </div>

          <div className="grid gap-3">
            {note.pdfs.map((pdfItem, idx) => {
              if (!pdfItem) return null;

              // Normalize format → always object { url, title }
              const pdf =
                typeof pdfItem === "string"
                  ? { url: pdfItem, title: `Attachment ${idx + 1}` }
                  : pdfItem;

              const pdfUrl = pdf?.url || "";
              if (!pdfUrl) return null;

              // Fallback title → API's title > filename > generic
              const fileName = pdfUrl.split("/").pop();
              const displayTitle =
                pdf.title || fileName || `Attachment ${idx + 1}`;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors group cursor-pointer"
                  onClick={() => {
                    setSelectedPdf({ url: pdfUrl, title: displayTitle });
                    setShowPreview(true);
                  }}
                >
                  {/* Icon + Title */}
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="flex-shrink-0">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-red-500/80 group-hover:text-red-500 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base text-gray-100 font-medium truncate">
                        {displayTitle}
                      </h3>
                      {fileName && (
                        <p className="text-xs sm:text-sm text-gray-400 truncate">
                          {fileName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {/* Preview PDF */}
                    <button
                      onClick={() => {
                        setSelectedPdf({ url: pdfUrl, title: displayTitle });
                        setShowPreview(true);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                      title="Preview PDF"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPreview && selectedPdf && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 w-full h-full flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-800">
              <h3 className="text-base sm:text-lg font-medium text-gray-100 truncate mr-2">
                {selectedPdf.title || "PDF Preview"}
              </h3>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setSelectedPdf(null);
                }}
                className="text-gray-400 hover:text-gray-300 p-1"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 bg-gray-800">
              <iframe
                src={selectedPdf.url}
                title={selectedPdf.title || "PDF Preview"}
                className="w-full h-full"
                style={{ border: "none" }}
              />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
