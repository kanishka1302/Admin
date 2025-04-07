import { Navigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? children : <Navigate to="/login" />;

  return children;
};

export default PrivateRoute;
