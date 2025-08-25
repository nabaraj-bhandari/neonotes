import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-slate-800 border-b border-blue-900/30 w-full shadow-lg">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-14 sm:h-16">
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
          <svg
            className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="text-lg sm:text-xl font-bold text-gray-100">
            NeoNotes
          </span>
        </Link>
      </div>
    </nav>
  );
}
