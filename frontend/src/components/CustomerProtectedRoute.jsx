import { Navigate } from "react-router-dom";
import { isCustomerAuthenticated } from "../utils/auth";

function CustomerProtectedRoute({ children }) {
  if (!isCustomerAuthenticated()) {
    return <Navigate to="/customer/login" replace />;
  }

  return children;
}

export default CustomerProtectedRoute;
