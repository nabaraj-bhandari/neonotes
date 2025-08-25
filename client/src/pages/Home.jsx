import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import NotesEditor from "../components/NotesEditor";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  // Fetch all notes
  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/notes/`);
      setNotes(res.data);
    } catch (err) {
      toast.error("Failed to fetch notes");
      console.error(err);
    }
  };

  // Load notes on mount
  useEffect(() => {
    fetchNotes();
  }, []);

  // Delete note
  const handleDelete = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/notes/${noteId}`, {
        headers: { "x-admin-pass": import.meta.env.VITE_ADMIN_PASS },
      });
      toast.success("Note deleted successfully");
      fetchNotes();
    } catch (err) {
      toast.error("Failed to delete note");
      console.error(err);
    }
  };

  // Edit note
  const handleEdit = (note) => {
    setSelectedNote(note);
    setIsEditing(true);
    setShowEditor(true);
  };

  // Handle save (create/update)
  const handleSave = async (noteData) => {
    try {
      if (isEditing && selectedNote) {
        // For updates, we need to handle the case where PDFs might be removed
        const formData = new FormData();
        formData.append("title", noteData.title);
        formData.append("content", noteData.content);

        // Add new PDFs
        noteData.pdfs?.forEach((pdf) => {
          if (pdf instanceof File) {
            formData.append("pdfs", pdf);
          }
        });

        // Calculate PDFs to remove (comparing with original note's PDFs)
        const existingPdfUrls = selectedNote.pdfs || [];
        const removePdfs = existingPdfUrls.filter(
          (url) =>
            !noteData.pdfs?.some(
              (pdf) =>
                pdf === url ||
                (pdf instanceof File && pdf.name === url.split("/").pop())
            )
        );

        if (removePdfs.length > 0) {
          formData.append("removePdfs", JSON.stringify(removePdfs));
        }

        await axios.put(`${API_BASE_URL}/notes/${selectedNote._id}`, formData, {
          headers: {
            "x-admin-pass": import.meta.env.VITE_ADMIN_PASS,
          },
        });
        toast.success("Note updated successfully");
      } else {
        // For new notes, simply pass the form data
        const formData = new FormData();
        formData.append("title", noteData.title);
        formData.append("content", noteData.content);
        noteData.pdfs?.forEach((pdf) => formData.append("pdfs", pdf));

        await axios.post(`${API_BASE_URL}/notes/`, formData, {
          headers: {
            "x-admin-pass": import.meta.env.VITE_ADMIN_PASS,
          },
        });
        toast.success("Note created successfully");
      }

      // Reset state and refresh notes
      setSelectedNote(null);
      setIsEditing(false);
      setShowEditor(false);
      fetchNotes();
    } catch (err) {
      toast.error(
        isEditing ? "Failed to update note" : "Failed to create note"
      );
      console.error(err);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notes</h1>
        <button
          onClick={() => {
            setSelectedNote(null);
            setIsEditing(false);
            setShowEditor(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Create Note
        </button>
      </div>

      {/* Editor Section */}
      {showEditor && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {isEditing ? "Edit Note" : "Create Note"}
            </h2>
            <button
              onClick={() => {
                setShowEditor(false);
                setSelectedNote(null);
                setIsEditing(false);
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
          <NotesEditor
            initialTitle={selectedNote?.title || ""}
            initialContent={selectedNote?.content || ""}
            onSave={handleSave}
            apiBaseUrl={API_BASE_URL}
            adminPass={import.meta.env.VITE_ADMIN_PASS}
          />
        </div>
      )}

      {/* Notes List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <div
            key={note._id}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
            <div className="prose prose-sm max-w-none mb-4 line-clamp-3">
              {note.content.slice(0, 150)}...
            </div>

            {/* PDF attachments */}
            {note.pdfs?.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Attachments:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {note.pdfs.map((pdf, idx) => (
                    <a
                      key={idx}
                      href={pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      PDF {idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => handleEdit(note)}
                className="text-blue-500 hover:text-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(note._id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>

            {/* Metadata */}
            <div className="text-xs text-gray-500 mt-2">
              Created: {new Date(note.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {notes.length === 0 && !showEditor && (
        <div className="text-center text-gray-500 mt-8">
          No notes yet. Click "Create Note" to get started.
        </div>
      )}
    </div>
  );
}
