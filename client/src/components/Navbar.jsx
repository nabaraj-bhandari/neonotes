import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Home Link */}
          <Link to="/" className="flex items-center gap-2">
            <svg
              className="w-8 h-8 text-blue-500"
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
            <span className="text-xl font-bold text-gray-100">NeoNotes</span>
          </Link>

          {/* Admin Link (hidden on mobile) */}
          <Link
            to="/admin"
            className="hidden md:block px-4 py-2 text-gray-300 hover:text-gray-100 transition-colors"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </nav>
  );
}
