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
      className="block bg-slate-800/50 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-200 border border-blue-900/10 hover:border-orange-500/20 shadow-sm hover:shadow-md"
    >
      <h2 className="text-lg sm:text-xl font-semibold text-blue-100 mb-2 sm:mb-3 line-clamp-2 font-serif">
        {note.title}
      </h2>
      <div
        data-color-mode="dark"
        className="text-gray-300 line-clamp-1 mb-2 sm:mb-3 font-serif text-base sm:text-lg leading-relaxed opacity-75"
      >
        <div className="wmde-markdown-var">
          <div className="markdown-content prose-base sm:prose-lg prose-invert prose-slate">
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
              {note.content.split("\n")[0]}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* PDF badges */}
      {note.pdfs?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {note.pdfs.map((_, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-orange-500/5 text-orange-300/90 text-xs rounded-sm border border-orange-500/10"
            >
              PDF {idx + 1}
            </span>
          ))}
        </div>
      )}

      {/* Metadata */}
      <div className="text-xs text-blue-400/50">
        {new Date(note.createdAt).toLocaleDateString()}
      </div>
    </Link>
  );
}
