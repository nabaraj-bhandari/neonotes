import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import NotesList from "./pages/NotesList";
import NoteDetails from "./pages/NoteDetails";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-900 text-gray-100">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<NotesList />} />
              <Route path="/:id" element={<NoteDetails />} />
              <Route path="/admin/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <AdminPanel />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
          <ToastContainer
            position="bottom-right"
            theme="dark"
            autoClose={3000}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
