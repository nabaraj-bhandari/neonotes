import { Link } from "react-router-dom";

export default function NoteCard({ note }) {
  return (
    <Link
      to={`/${note._id}`}
      className="block bg-slate-800/50 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-200 border border-blue-900/10 hover:border-orange-500/20 shadow-sm hover:shadow-md"
    >
      <h2 className="text-lg sm:text-xl font-semibold text-blue-100 mb-2 sm:mb-3 line-clamp-2 font-serif">
        {note.title}
      </h2>

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
