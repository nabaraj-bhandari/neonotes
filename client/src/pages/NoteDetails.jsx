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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!note) return null;

  return (
    <article className="space-y-8 sm:space-y-12">
      {/* Title and Back button on same row */}
      <div className="flex flex-row justify-between items-start gap-4 sm:gap-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-100 break-words font-serif leading-tight">
          {note.title}
        </h1>
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="text-white flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm sm:text-base font-medium shadow-lg hover:shadow-orange-500/10"
        >
          ← All Notes
        </button>
      </div>

      {/* Metadata */}
      <div className="text-base sm:text-lg text-blue-400/70 font-serif">
        Created: {new Date(note.createdAt).toLocaleDateString()}
      </div>

      {/* Content */}
      <div data-color-mode="dark" className="w-full">
        <div className="wmde-markdown-var w-full">
          <div className="w-full">
            <div className="wmde-markdown-color markdown-content w-full max-w-none prose-invert prose-slate font-serif prose-p:text-xl sm:prose-p:text-2xl prose-p:!leading-relaxed prose-p:text-gray-200 prose-headings:font-serif prose-h1:text-4xl sm:prose-h1:text-5xl prose-h2:text-3xl sm:prose-h2:text-4xl prose-h3:text-2xl sm:prose-h3:text-3xl prose-headings:text-blue-100 prose-headings:leading-tight prose-a:text-orange-400 hover:prose-a:text-orange-300 prose-code:text-blue-300 prose-strong:text-blue-200 [&>*]:my-6 sm:[&>*]:my-8 prose-li:text-xl sm:prose-li:text-2xl">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[[rehypeKatex, { strict: false }], rehypeRaw]}
                components={{
                  img: ({ node, ...props }) => (
                    <div className="flex justify-center my-6">
                      <img
                        {...props}
                        className="wmde-markdown-image max-w-full h-auto object-contain rounded-lg shadow-lg"
                        style={{ maxHeight: "80vh" }}
                        alt={props.alt || "Note image"}
                        loading="lazy"
                      />
                    </div>
                  ),
                  code: ({ node, inline, className, children, ...props }) => (
                    <code
                      className={`${className || ""} ${
                        inline
                          ? "wmde-markdown-inline-code text-xl"
                          : "wmde-markdown-code text-lg"
                      }`}
                      {...props}
                    >
                      {children}
                    </code>
                  ),
                  pre: ({ node, children, ...props }) => (
                    <pre
                      className="wmde-markdown-pre text-lg leading-relaxed my-6"
                      {...props}
                    >
                      {children}
                    </pre>
                  ),
                  table: ({ node, children, ...props }) => (
                    <div className="wmde-markdown-table-wrapper my-6">
                      <table className="wmde-markdown-table text-lg" {...props}>
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ node, children, ...props }) => (
                    <th
                      className="wmde-markdown-th text-lg font-serif"
                      {...props}
                    >
                      {children}
                    </th>
                  ),
                  td: ({ node, children, ...props }) => (
                    <td
                      className="wmde-markdown-td text-lg font-serif"
                      {...props}
                    >
                      {children}
                    </td>
                  ),
                  p: ({ node, children, ...props }) => (
                    <p
                      className="wmde-markdown-p text-xl sm:text-2xl !leading-relaxed my-6 font-serif"
                      {...props}
                    >
                      {children}
                    </p>
                  ),
                  blockquote: ({ node, children, ...props }) => (
                    <blockquote
                      className="wmde-markdown-blockquote text-xl sm:text-2xl italic my-6 border-l-4 border-orange-500/30 pl-6"
                      {...props}
                    >
                      {children}
                    </blockquote>
                  ),
                  h1: ({ node, children, ...props }) => (
                    <h1
                      className="text-4xl sm:text-5xl font-serif font-bold text-blue-100 my-8"
                      {...props}
                    >
                      {children}
                    </h1>
                  ),
                  h2: ({ node, children, ...props }) => (
                    <h2
                      className="text-3xl sm:text-4xl font-serif font-bold text-blue-100 my-6"
                      {...props}
                    >
                      {children}
                    </h2>
                  ),
                  h3: ({ node, children, ...props }) => (
                    <h3
                      className="text-2xl sm:text-3xl font-serif font-bold text-blue-100 my-4"
                      {...props}
                    >
                      {children}
                    </h3>
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
        <div className="bg-slate-800/50 rounded-lg p-4 sm:p-8 border border-blue-900/20 shadow-lg">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <svg
              className="w-6 h-6 text-orange-500 flex-shrink-0"
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
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-100">
              Attachments ({note.pdfs.length})
            </h2>
          </div>

          <div className="grid gap-1.5 sm:gap-3">
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
                  className="flex items-center justify-between p-2 sm:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors group"
                >
                  {/* Icon + Title - Clickable area for direct PDF open */}
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 sm:gap-3 min-w-0 flex-grow cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
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
                      <h3 className="text-xs sm:text-sm md:text-base text-gray-100 font-medium truncate">
                        {displayTitle}
                      </h3>
                      {fileName && (
                        <p className="text-xs sm:text-xs md:text-sm text-gray-400 truncate">
                          {fileName}
                        </p>
                      )}
                    </div>
                  </a>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {/* Preview PDF */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPdf({ url: pdfUrl, title: displayTitle });
                        setShowPreview(true);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                      title="Preview in app"
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
