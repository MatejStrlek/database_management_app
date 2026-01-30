import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getAuthToken } from '../../services/authService';

const ProtectedRoute = ({ children }) => {
    const token = getAuthToken();
    if (!token) {
        return <Navigate to="/login" />;
    }
    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ProtectedRoute;