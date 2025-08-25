import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import NoteCard from "../components/NoteCard";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function NotesList() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchNotes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 px-3 sm:px-0">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">
        Latest Notes
      </h1>

      {notes.length === 0 ? (
        <p className="text-gray-400 text-center py-6 sm:py-8">
          No notes available.
        </p>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note._id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
