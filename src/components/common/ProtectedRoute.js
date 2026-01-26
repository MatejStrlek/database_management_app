import { Navigate } from 'react-router-dom';
import { getAuthToken } from '../../services/authService';

const ProtectedRoute = ({ children }) => {
    const token = getAuthToken();
    if (!token) {
        return <Navigate to="/login" />;
    }
    return children;
};

export default ProtectedRoute;