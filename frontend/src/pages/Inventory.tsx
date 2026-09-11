import { FormEvent, useEffect, useState } from "react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

interface StockMovement {
  id: number;
  productId: number;
  quantity: number;
  type: string;
  reason: string;
  createdAt: string;

  product: {
    id: number;
    name: string;
    sku: string;
  };

  createdBy?: {
    id: number;
    name: string;
    role: string;
  };
}

interface Product {
  id: number;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
}

const Inventory = () => {
  const { user, token } = useAuth();

  const [movements, setMovements] =
    useState<StockMovement[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [productId, setProductId] = useState("");
  const [type, setType] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    productId: "",
    quantity: "",
    type: "IN",
    reason: "",
  });

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit: 100,
        },
      });

      setProducts(response.data.data);

    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to load products"
      );
    }
  };

  const fetchMovements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/stock/movements",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: 50,
            productId:
              productId || undefined,
            type:
              type || undefined,
          },
        }
      );

      setMovements(response.data.data);

    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to load stock movements"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  useEffect(() => {
    fetchMovements();
  }, [token, productId, type]);

  const handleStockSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setFormLoading(true);
      setFormError("");

      await api.post(
        "/stock/movements",
        {
          productId: Number(form.productId),
          quantity: Number(form.quantity),
          type: form.type,
          reason: form.reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setForm({
        productId: "",
        quantity: "",
        type: "IN",
        reason: "",
      });

      setShowForm(false);

      await fetchMovements();
      await fetchProducts();

    } catch (error: any) {
      setFormError(
        error.response?.data?.message ||
          "Failed to update stock"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="app-layout">

      <Sidebar />

      <main className="main-content">

        <header className="topbar">

          <div>
            <h1>Inventory</h1>

            <p>
              Manage stock levels and movement history
            </p>
          </div>

          <div className="user-info">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>

        </header>

        <section className="dashboard-panel">

          <div className="panel-header">
            <h2>Current Stock</h2>
          </div>

          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Current Stock</th>
                  <th>Minimum Stock</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {products.map((product) => {

                  const low =
                    product.currentStock <=
                    product.minStock;

                  return (
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

                      <td>

                        <span
                          className={
                            low
                              ? "stock-low-badge"
                              : "stock-normal-badge"
                          }
                        >
                          {low
                            ? "LOW STOCK"
                            : "NORMAL"}
                        </span>

                      </td>

                    </tr>
                  );

                })}

              </tbody>

            </table>

          </div>

        </section>

        <section className="page-toolbar">

          <select
            value={productId}
            onChange={(event) =>
              setProductId(event.target.value)
            }
          >

            <option value="">
              All Products
            </option>

            {products.map((product) => (
              <option
                key={product.id}
                value={product.id}
              >
                {product.name}
              </option>
            ))}

          </select>

          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value)
            }
          >

            <option value="">
              All Movements
            </option>

            <option value="IN">
              Stock IN
            </option>

            <option value="OUT">
              Stock OUT
            </option>

          </select>

          <button
            className="primary-button"
            onClick={() => {
              setFormError("");
              setShowForm(true);
            }}
          >
            + Stock Movement
          </button>

        </section>

        {error && (
          <div className="page-error-box">
            {error}
          </div>
        )}

        <section className="dashboard-panel">

          <div className="panel-header">
            <h2>Stock Movement History</h2>
          </div>

          {loading ? (

            <div className="table-loading">
              Loading movements...
            </div>

          ) : movements.length === 0 ? (

            <div className="empty-state">
              No stock movements found.
            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Reason</th>
                    <th>Created By</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>

                  {movements.map((movement) => (
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

                      <td>
                        {movement.createdBy?.name || "-"}
                      </td>

                      <td>
                        {formatDate(
                          movement.createdAt
                        )}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

      {showForm && (
        <div className="modal-overlay">

          <div className="modal-card">

            <div className="modal-header">

              <div>

                <h2>
                  Stock Movement
                </h2>

                <p>
                  Add or remove inventory stock
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowForm(false)
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleStockSubmit}
            >

              <div className="form-grid">

                <div className="form-group full-width">

                  <label>
                    Product *
                  </label>

                  <select
                    value={form.productId}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        productId:
                          event.target.value,
                      }))
                    }
                    required
                  >

                    <option value="">
                      Select product
                    </option>

                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name} ({product.sku})
                      </option>
                    ))}

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Movement Type *
                  </label>

                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        type:
                          event.target.value,
                      }))
                    }
                  >

                    <option value="IN">
                      Stock IN
                    </option>

                    <option value="OUT">
                      Stock OUT
                    </option>

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Quantity *
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        quantity:
                          event.target.value,
                      }))
                    }
                    required
                  />

                </div>

                <div className="form-group full-width">

                  <label>
                    Reason *
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. New warehouse shipment"
                    value={form.reason}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        reason:
                          event.target.value,
                      }))
                    }
                    required
                  />

                </div>

              </div>

              {formError && (
                <div className="form-error">
                  {formError}
                </div>
              )}

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={formLoading}
                >
                  {formLoading
                    ? "Updating..."
                    : "Update Stock"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default Inventory;