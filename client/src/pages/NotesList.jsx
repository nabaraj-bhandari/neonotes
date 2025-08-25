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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-blue-100 border-b border-blue-900/30 pb-4 font-serif">
        Latest Notes
      </h1>

      {notes.length === 0 ? (
        <p className="text-blue-400/70 text-center py-6 sm:py-8 font-serif text-lg">
          No notes available.
        </p>
      ) : (
        <div className="grid gap-6 sm:gap-8 grid-cols-1 xl:grid-cols-2">
          {notes.map((note) => (
            <NoteCard key={note._id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
