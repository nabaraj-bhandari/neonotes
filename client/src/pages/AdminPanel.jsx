import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import NotesEditor from "../components/NotesEditor";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function AdminPanel() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Fetch all notes
  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/notes/`);
      setNotes(res.data);
    } catch (err) {
      toast.error("Failed to fetch notes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Delete note
  const handleDelete = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Note deleted successfully");
      fetchNotes();
    } catch (err) {
      toast.error("Failed to delete note");
      console.error(err);
    }
  };

  // Handle save (create/update)
  const handleSave = async (noteData) => {
    try {
      if (selectedNote) {
        // Handle update
        console.log("Update data:", { noteData, selectedNote });
        const formData = new FormData();
        formData.append("title", noteData.title);
        formData.append("content", noteData.content);

        // Handle PDFs from the editor
        if (noteData.pdfs?.length > 0) {
          // Append each PDF file and its title
          noteData.pdfs.forEach((pdf) => {
            formData.append("pdfs", pdf.file);
            formData.append("pdfTitles", pdf.title);
          });
        }

        // Calculate PDFs to remove
        const existingPdfs = selectedNote.pdfs || [];
        const removePdfs = existingPdfs
          .filter((existingPdf) => {
            const pdfUrl =
              typeof existingPdf === "string" ? existingPdf : existingPdf.url;
            return !noteData.existingPdfs?.includes(pdfUrl);
          })
          .map((pdf) => (typeof pdf === "string" ? pdf : pdf.url));

        if (removePdfs.length > 0) {
          formData.append("removePdfs", JSON.stringify(removePdfs));
        }

        const token = localStorage.getItem("token");
        await axios.put(`${API_BASE_URL}/notes/${selectedNote._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Note updated successfully");
      } else {
        // Handle create
        const formData = new FormData();
        formData.append("title", noteData.title);
        formData.append("content", noteData.content);

        // Handle PDFs from the editor
        if (noteData.pdfs?.length > 0) {
          // Add each PDF file
          noteData.pdfs.forEach((pdf) => {
            formData.append("pdfs", pdf.file);
          });
          // Add all PDF titles
          if (noteData.pdfTitles) {
            noteData.pdfTitles.forEach((title) => {
              formData.append("pdfTitles", title);
            });
          }
        }

        const token = localStorage.getItem("token");
        await axios.post(`${API_BASE_URL}/notes/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Note created successfully");
      }

      // Update notes list but keep editor open
      fetchNotes();

      // If we're creating a new note, reset the form
      if (!selectedNote) {
        setSelectedNote(null);
        setShowEditor(false);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(
        selectedNote
          ? `Failed to update note: ${errorMessage}`
          : `Failed to create note: ${errorMessage}`
      );
      console.error("API Error:", {
        status: err.response?.status,
        data: err.response?.data,
        error: err,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (showEditor) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-100">
            {selectedNote ? "Edit Note" : "Create New Note"}
          </h1>
          <button
            onClick={() => {
              setShowEditor(false);
              setSelectedNote(null);
            }}
            className="text-gray-400 hover:text-gray-300"
          >
            Cancel
          </button>
        </div>
        <NotesEditor
          initialTitle={selectedNote?.title || ""}
          initialContent={selectedNote?.content || ""}
          initialPdfs={selectedNote?.pdfs || []}
          isEdit={!!selectedNote}
          onSave={handleSave}
          onBack={() => {
            setShowEditor(false);
            setSelectedNote(null);
          }}
          apiBaseUrl={API_BASE_URL}
          adminPass={import.meta.env.VITE_ADMIN_PASS}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-100">Admin Panel</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowEditor(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Note
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                PDFs
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {notes.map((note) => (
              <tr key={note._id} className="hover:bg-gray-750">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/${note._id}`}
                    className="text-gray-100 hover:text-blue-400"
                  >
                    {note.title}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                  {new Date(note.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                  {note.pdfs?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedNote(note);
                      setShowEditor(true);
                    }}
                    className="text-blue-400 hover:text-blue-300 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
