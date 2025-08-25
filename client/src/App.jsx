import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import NotesList from "./pages/NotesList";
import NoteDetails from "./pages/NoteDetails";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-900 text-gray-100 flex flex-col">
          <Navbar />
          <div className="flex-grow flex flex-col">
            <main className="flex-grow w-full">
              <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full">
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
              </div>
            </main>
          </div>
          <ToastContainer
            position="bottom-right"
            theme="dark"
            autoClose={3000}
          />
        </div>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;
