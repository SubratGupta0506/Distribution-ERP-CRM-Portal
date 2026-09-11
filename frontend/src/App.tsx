import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Challans from "./pages/Challans";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route element={<ProtectedRoute />}>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/customers"
          element={<Customers />}
        />

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/inventory"
          element={<Inventory />}
        />

        <Route
          path="/challans"
          element={<Challans />}
        />

      </Route>

    </Routes>
  );
}

export default App;