import { useEffect, useState } from "react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

interface DashboardData {
  summary: {
    totalCustomers: number;
    totalProducts: number;
    lowStockCount: number;
    draftChallans: number;
    confirmedChallans: number;
    cancelledChallans: number;
  };

  lowStockProducts: {
    id: number;
    name: string;
    sku: string;
    currentStock: number;
    minStock: number;
  }[];

  recentChallans: {
    id: number;
    challanNumber: string;
    status: string;
    totalQuantity: number;
    createdAt: string;
    customer: {
      name: string;
      businessName?: string;
    };
  }[];

  recentStockMovements: {
    id: number;
    quantity: number;
    type: string;
    reason: string;
    createdAt: string;
    product: {
      name: string;
      sku: string;
    };
  }[];
}

const Dashboard = () => {
  const { user, token } = useAuth();

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDashboard(response.data.data);
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  if (loading) {
    return (
      <div className="page-loading">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        {error}
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const {
    summary,
    lowStockProducts,
    recentChallans,
    recentStockMovements,
  } = dashboard;

  return (
    <div className="app-layout">

      {/* Sidebar */}

      <Sidebar />

      {/* Main Content */}

      <main className="main-content">

        {/* Top Bar */}

        <header className="topbar">

          <div>
            <h1>Dashboard</h1>

            <p>
              Overview of your business operations
            </p>
          </div>

          <div className="user-info">

            <strong>
              {user?.name}
            </strong>

            <span>
              {user?.role}
            </span>

          </div>

        </header>

        {/* Summary Cards */}

        <section className="summary-grid">

          <div className="summary-card">
            <span>Total Customers</span>

            <strong>
              {summary.totalCustomers}
            </strong>
          </div>

          <div className="summary-card">
            <span>Total Products</span>

            <strong>
              {summary.totalProducts}
            </strong>
          </div>

          <div className="summary-card">
            <span>Low Stock</span>

            <strong>
              {summary.lowStockCount}
            </strong>
          </div>

          <div className="summary-card">
            <span>Draft Challans</span>

            <strong>
              {summary.draftChallans}
            </strong>
          </div>

          <div className="summary-card">
            <span>Confirmed</span>

            <strong>
              {summary.confirmedChallans}
            </strong>
          </div>

          <div className="summary-card">
            <span>Cancelled</span>

            <strong>
              {summary.cancelledChallans}
            </strong>
          </div>

        </section>

        {/* Content Grid */}

        <section className="dashboard-grid">

          {/* Recent Challans */}

          <div className="dashboard-panel">

            <div className="panel-header">
              <h2>Recent Challans</h2>
            </div>

            {recentChallans.length === 0 ? (

              <p className="empty-state">
                No challans found.
              </p>

            ) : (

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>
                      <th>Challan</th>
                      <th>Customer</th>
                      <th>Quantity</th>
                      <th>Status</th>
                    </tr>

                  </thead>

                  <tbody>

                    {recentChallans.map(
                      (challan) => (

                        <tr key={challan.id}>

                          <td>
                            {challan.challanNumber}
                          </td>

                          <td>
                            {challan.customer.name}
                          </td>

                          <td>
                            {challan.totalQuantity}
                          </td>

                          <td>

                            <span
                              className={`status-badge ${challan.status.toLowerCase()}`}
                            >
                              {challan.status}
                            </span>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

          {/* Low Stock */}

          <div className="dashboard-panel">

            <div className="panel-header">
              <h2>Low Stock</h2>
            </div>

            {lowStockProducts.length === 0 ? (

              <p className="empty-state">
                No low stock products.
              </p>

            ) : (

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Stock</th>
                      <th>Minimum</th>
                    </tr>

                  </thead>

                  <tbody>

                    {lowStockProducts.map(
                      (product) => (

                        <tr key={product.id}>

                          <td>
                            {product.name}
                          </td>

                          <td>
                            {product.sku}
                          </td>

                          <td>
                            {product.currentStock}
                          </td>

                          <td>
                            {product.minStock}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </section>

        {/* Stock Movements */}

        <section className="dashboard-panel">

          <div className="panel-header">
            <h2>Recent Stock Movements</h2>
          </div>

          {recentStockMovements.length === 0 ? (

            <p className="empty-state">
              No stock movements found.
            </p>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Reason</th>
                  </tr>

                </thead>

                <tbody>

                  {recentStockMovements.map(
                    (movement) => (

                      <tr key={movement.id}>

                        <td>
                          {movement.product.name}
                        </td>

                        <td>

                          <span
                            className={`movement-type ${movement.type.toLowerCase()}`}
                          >
                            {movement.type}
                          </span>

                        </td>

                        <td>
                          {movement.quantity}
                        </td>

                        <td>
                          {movement.reason}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
};

export default Dashboard;