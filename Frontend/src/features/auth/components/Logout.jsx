import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Logout() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { logout } = useAuth();

  async function handleLogout() {
    try {
      setIsLoading(true);
      setError(null);
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setError('Logout failed. Please try again.');
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="logout-container">
      <button 
        type="button"
        onClick={handleLogout} 
        disabled={isLoading}
        className="rounded-lg border border-[#7078cb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2a2f68] disabled:opacity-50"
      >
        {isLoading ? 'Logging out...' : 'Logout'}
      </button>
      {error && <p className="mt-2 text-xs font-semibold text-red-500">{error}</p>}
    </div>
  );
}
