import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "../styles/markdown.css";

export default function NoteCard({ note }) {
  return (
    <Link
      to={`/${note._id}`}
      className="block bg-gray-800 rounded-lg p-4 sm:p-6 hover:bg-gray-700 transition-colors"
    >
      <h2 className="text-lg sm:text-xl font-semibold text-gray-100 mb-2 line-clamp-2">
        {note.title}
      </h2>
      <div
        data-color-mode="dark"
        className="text-gray-400 line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4"
      >
        <div className="wmde-markdown-var">
          <div className="markdown-content">
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
              {note.content.slice(0, 150)}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* PDF badges */}
      {note.pdfs?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {note.pdfs.map((_, idx) => (
            <span
              key={idx}
              className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-700 text-gray-300 text-xs rounded"
            >
              PDF {idx + 1}
            </span>
          ))}
        </div>
      )}

      {/* Metadata */}
      <div className="text-xs sm:text-sm text-gray-500">
        {new Date(note.createdAt).toLocaleDateString()}
      </div>
    </Link>
  );
}
