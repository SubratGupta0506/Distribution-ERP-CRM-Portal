import { FormEvent, useEffect, useState } from "react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unitPrice: string | number;
  currentStock: number;
  minStock: number;
  location?: string;
  warehouse?: string;
}

interface ProductForm {
  name: string;
  sku: string;
  category: string;
  unitPrice: string;
  currentStock: string;
  minStock: string;
  location: string;
  warehouse: string;
}

const emptyForm: ProductForm = {
  name: "",
  sku: "",
  category: "",
  unitPrice: "",
  currentStock: "0",
  minStock: "0",
  location: "",
  warehouse: "",
};

const Products = () => {
  const { user, token } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,
          limit: 8,
          search: search || undefined,
          category: category || undefined,
        },
      });

      setProducts(response.data.data);

      setTotalPages(
        response.data.pagination?.totalPages || 1
      );
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, category, token]);

  const handleFormChange = (
    field: keyof ProductForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);

    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unitPrice: String(product.unitPrice),
      currentStock: String(product.currentStock),
      minStock: String(product.minStock),
      location: product.location || "",
      warehouse: product.warehouse || "",
    });

    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setFormLoading(true);
      setFormError("");

      const payload = {
        name: form.name,
        sku: form.sku,
        category: form.category,
        unitPrice: Number(form.unitPrice),
        currentStock: Number(form.currentStock),
        minStock: Number(form.minStock),
        location: form.location || undefined,
        warehouse: form.warehouse || undefined,
      };

      if (editingProduct) {
        await api.put(
          `/products/${editingProduct.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await api.post(
          "/products",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      closeForm();
      fetchProducts();

    } catch (error: any) {
      setFormError(
        error.response?.data?.message ||
          "Failed to save product"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategory = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  return (
    <div className="app-layout">

      <Sidebar />

      <main className="main-content">

        <header className="topbar">

          <div>
            <h1>Products</h1>

            <p>
              Manage products and inventory levels
            </p>
          </div>

          <div className="user-info">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>

        </header>

        <section className="page-toolbar">

          <input
            className="search-input"
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) =>
              handleSearch(event.target.value)
            }
          />

          <input
            className="filter-input"
            type="text"
            placeholder="Category"
            value={category}
            onChange={(event) =>
              handleCategory(event.target.value)
            }
          />

          <button
            className="primary-button"
            onClick={openAddForm}
          >
            + Add Product
          </button>

        </section>

        {error && (
          <div className="page-error-box">
            {error}
          </div>
        )}

        <section className="dashboard-panel">

          {loading ? (
            <div className="table-loading">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              No products found.
            </div>
          ) : (
            <div className="table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Stock</th>
                    <th>Min Stock</th>
                    <th>Warehouse</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {products.map((product) => {

                    const isLowStock =
                      product.currentStock <=
                      product.minStock;

                    return (
                      <tr key={product.id}>

                        <td>
                          <strong>
                            {product.name}
                          </strong>
                        </td>

                        <td>
                          {product.sku}
                        </td>

                        <td>
                          {product.category}
                        </td>

                        <td>
                          ₹
                          {Number(
                            product.unitPrice
                          ).toLocaleString()}
                        </td>

                        <td>
                          <span
                            className={
                              isLowStock
                                ? "stock-low"
                                : "stock-normal"
                            }
                          >
                            {product.currentStock}
                          </span>
                        </td>

                        <td>
                          {product.minStock}
                        </td>

                        <td>
                          {product.warehouse || "-"}
                        </td>

                        <td>
                          <button
                            className="secondary-button"
                            onClick={() =>
                              openEditForm(product)
                            }
                          >
                            Edit
                          </button>
                        </td>

                      </tr>
                    );

                  })}

                </tbody>

              </table>

            </div>
          )}

        </section>

        <div className="pagination">

          <button
            className="secondary-button"
            disabled={page <= 1}
            onClick={() =>
              setPage(
                (previous) => previous - 1
              )
            }
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            className="secondary-button"
            disabled={page >= totalPages}
            onClick={() =>
              setPage(
                (previous) => previous + 1
              )
            }
          >
            Next
          </button>

        </div>

      </main>

      {showForm && (
        <div className="modal-overlay">

          <div className="modal-card">

            <div className="modal-header">

              <div>

                <h2>
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p>
                  Enter product information
                </p>

              </div>

              <button
                className="modal-close"
                onClick={closeForm}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                <div className="form-group">
                  <label>Product Name *</label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      handleFormChange(
                        "name",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>SKU *</label>

                  <input
                    type="text"
                    value={form.sku}
                    onChange={(event) =>
                      handleFormChange(
                        "sku",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>

                  <input
                    type="text"
                    value={form.category}
                    onChange={(event) =>
                      handleFormChange(
                        "category",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Unit Price *</label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.unitPrice}
                    onChange={(event) =>
                      handleFormChange(
                        "unitPrice",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Current Stock</label>

                  <input
                    type="number"
                    min="0"
                    value={form.currentStock}
                    onChange={(event) =>
                      handleFormChange(
                        "currentStock",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Minimum Stock</label>

                  <input
                    type="number"
                    min="0"
                    value={form.minStock}
                    onChange={(event) =>
                      handleFormChange(
                        "minStock",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>

                  <input
                    type="text"
                    value={form.location}
                    onChange={(event) =>
                      handleFormChange(
                        "location",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Warehouse</label>

                  <input
                    type="text"
                    value={form.warehouse}
                    onChange={(event) =>
                      handleFormChange(
                        "warehouse",
                        event.target.value
                      )
                    }
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
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={formLoading}
                >
                  {formLoading
                    ? "Saving..."
                    : editingProduct
                    ? "Update Product"
                    : "Add Product"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default Products;