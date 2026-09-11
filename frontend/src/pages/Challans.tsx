import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

interface Customer {
  id: number;
  name: string;
  businessName?: string;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  unitPrice: string | number;
  currentStock: number;
}

interface ChallanItem {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  unitPrice: string | number;
  quantity: number;
}

interface Challan {
  id: number;
  challanNumber: string;
  customerId: number;
  status: string;
  totalQuantity: number;
  createdAt: string;
  customer: Customer;
  items: ChallanItem[];
  createdBy?: {
    name: string;
    role: string;
  };
}

interface FormItem {
  productId: string;
  quantity: string;
}

const Challans = () => {
  const { user, token } = useAuth();

  const [challans, setChallans] =
    useState<Challan[]>([]);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [showCreate, setShowCreate] =
    useState(false);

  const [selectedChallan, setSelectedChallan] =
    useState<Challan | null>(null);

  const [formLoading, setFormLoading] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  const [customerId, setCustomerId] =
    useState("");

  const [items, setItems] =
    useState<FormItem[]>([
      {
        productId: "",
        quantity: "",
      },
    ]);

  const fetchChallans = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/challans",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page,
            limit: 8,
            search:
              search || undefined,
            status:
              status || undefined,
          },
        }
      );

      setChallans(
        response.data.data
      );

      setTotalPages(
        response.data.pagination
          ?.totalPages || 1
      );

    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to load challans"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get(
        "/customers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: 100,
          },
        }
      );

      setCustomers(
        response.data.data
      );

    } catch (error) {
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get(
        "/products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: 100,
          },
        }
      );

      setProducts(
        response.data.data
      );

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, [token]);

  useEffect(() => {
    fetchChallans();
  }, [
    token,
    page,
    search,
    status,
  ]);

  const openCreateForm = () => {
    setCustomerId("");

    setItems([
      {
        productId: "",
        quantity: "",
      },
    ]);

    setFormError("");
    setShowCreate(true);
  };

  const closeCreateForm = () => {
    setShowCreate(false);
    setFormError("");
  };

  const addItem = () => {
    setItems((previous) => [
      ...previous,
      {
        productId: "",
        quantity: "",
      },
    ]);
  };

  const removeItem = (
    index: number
  ) => {
    if (items.length === 1) {
      return;
    }

    setItems((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const updateItem = (
    index: number,
    field: keyof FormItem,
    value: string
  ) => {
    setItems((previous) =>
      previous.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [field]: value,
              }
            : item
      )
    );
  };

  const handleCreate = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setFormLoading(true);
      setFormError("");

      if (!customerId) {
        setFormError(
          "Please select a customer."
        );
        return;
      }

      const validItems =
        items.filter(
          (item) =>
            item.productId &&
            Number(item.quantity) > 0
        );

      if (validItems.length === 0) {
        setFormError(
          "Please add at least one product with a valid quantity."
        );
        return;
      }

      await api.post(
        "/challans",
        {
          customerId:
            Number(customerId),

          items: validItems.map(
            (item) => ({
              productId:
                Number(item.productId),

              quantity:
                Number(item.quantity),
            })
          ),
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      closeCreateForm();

      await fetchChallans();

    } catch (error: any) {
      setFormError(
        error.response?.data?.message ||
          "Failed to create challan"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const viewChallan = async (
    id: number
  ) => {
    try {
      const response =
        await api.get(
          `/challans/${id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setSelectedChallan(
        response.data.data
      );

    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to load challan"
      );
    }
  };

  const confirmChallan = async (
    id: number
  ) => {
    const confirmed =
      window.confirm(
        "Confirm this challan? Stock will be deducted."
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.put(
        `/challans/${id}/confirm`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setSelectedChallan(null);

      await fetchChallans();

    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to confirm challan"
      );
    }
  };

  const cancelChallan = async (
    id: number
  ) => {
    const confirmed =
      window.confirm(
        "Cancel this challan?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.put(
        `/challans/${id}/cancel`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setSelectedChallan(null);

      await fetchChallans();

    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to cancel challan"
      );
    }
  };

  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleString();
  };

  return (
    <div className="app-layout">

      <Sidebar />

      <main className="main-content">

        <header className="topbar">

          <div>

            <h1>
              Sales Challans
            </h1>

            <p>
              Create and manage sales challans
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

        <section className="page-toolbar">

          <input
            className="search-input"
            type="text"
            placeholder="Search challans..."
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value
              );

              setPage(1);
            }}
          />

          <select
            value={status}
            onChange={(event) => {
              setStatus(
                event.target.value
              );

              setPage(1);
            }}
          >

            <option value="">
              All Status
            </option>

            <option value="DRAFT">
              Draft
            </option>

            <option value="CONFIRMED">
              Confirmed
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>

          </select>

          <button
            className="primary-button"
            onClick={
              openCreateForm
            }
          >
            + Create Challan
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
              Loading challans...
            </div>

          ) : challans.length === 0 ? (

            <div className="empty-state">
              No challans found.
            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>
                      Challan Number
                    </th>

                    <th>
                      Customer
                    </th>

                    <th>
                      Quantity
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Created By
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Actions
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {challans.map(
                    (challan) => (

                      <tr
                        key={
                          challan.id
                        }
                      >

                        <td>
                          <strong>
                            {
                              challan.challanNumber
                            }
                          </strong>
                        </td>

                        <td>
                          {
                            challan.customer
                              .name
                          }
                        </td>

                        <td>
                          {
                            challan.totalQuantity
                          }
                        </td>

                        <td>

                          <span
                            className={`status-badge ${challan.status.toLowerCase()}`}
                          >
                            {
                              challan.status
                            }
                          </span>

                        </td>

                        <td>
                          {
                            challan
                              .createdBy
                              ?.name || "-"
                          }
                        </td>

                        <td>
                          {formatDate(
                            challan.createdAt
                          )}
                        </td>

                        <td>

                          <button
                            className="secondary-button"
                            onClick={() =>
                              viewChallan(
                                challan.id
                              )
                            }
                          >
                            View
                          </button>

                        </td>

                      </tr>

                    )
                  )}

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
                (previous) =>
                  previous - 1
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
            disabled={
              page >= totalPages
            }
            onClick={() =>
              setPage(
                (previous) =>
                  previous + 1
              )
            }
          >
            Next
          </button>

        </div>

      </main>

      {showCreate && (
        <div className="modal-overlay">

          <div className="modal-card challan-modal">

            <div className="modal-header">

              <div>

                <h2>
                  Create Sales Challan
                </h2>

                <p>
                  Create a draft challan
                </p>

              </div>

              <button
                className="modal-close"
                onClick={
                  closeCreateForm
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleCreate
              }
            >

              <div className="form-group">

                <label>
                  Customer *
                </label>

                <select
                  value={customerId}
                  onChange={(event) =>
                    setCustomerId(
                      event.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    Select customer
                  </option>

                  {customers.map(
                    (customer) => (

                      <option
                        key={
                          customer.id
                        }
                        value={
                          customer.id
                        }
                      >

                        {customer.name}

                        {customer.businessName
                          ? ` - ${customer.businessName}`
                          : ""}

                      </option>

                    )
                  )}

                </select>

              </div>

              <div className="challan-items-header">

                <h3>
                  Products
                </h3>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    addItem
                  }
                >
                  + Add Product
                </button>

              </div>

              <div className="challan-items">

                {items.map(
                  (item, index) => {

                    const selectedProduct =
                      products.find(
                        (product) =>
                          product.id ===
                          Number(
                            item.productId
                          )
                      );

                    return (

                      <div
                        className="challan-item-row"
                        key={index}
                      >

                        <select
                          value={
                            item.productId
                          }
                          onChange={(event) =>
                            updateItem(
                              index,
                              "productId",
                              event.target.value
                            )
                          }
                          required
                        >

                          <option value="">
                            Select product
                          </option>

                          {products.map(
                            (product) => (

                              <option
                                key={
                                  product.id
                                }
                                value={
                                  product.id
                                }
                              >

                                {
                                  product.name
                                }

                                {" — "}

                                Stock:{" "}
                                {
                                  product.currentStock
                                }

                              </option>

                            )
                          )}

                        </select>

                        <input
                          type="number"
                          min="1"
                          placeholder="Quantity"
                          value={
                            item.quantity
                          }
                          onChange={(event) =>
                            updateItem(
                              index,
                              "quantity",
                              event.target.value
                            )
                          }
                          required
                        />

                        {selectedProduct && (
                          <span className="product-stock-info">
                            Available:{" "}
                            {
                              selectedProduct.currentStock
                            }
                          </span>
                        )}

                        {items.length > 1 && (
                          <button
                            type="button"
                            className="remove-item-button"
                            onClick={() =>
                              removeItem(
                                index
                              )
                            }
                          >
                            Remove
                          </button>
                        )}

                      </div>

                    );
                  }
                )}

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
                  onClick={
                    closeCreateForm
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    formLoading
                  }
                >
                  {formLoading
                    ? "Creating..."
                    : "Create Draft"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {selectedChallan && (
        <div className="modal-overlay">

          <div className="modal-card challan-detail-modal">

            <div className="modal-header">

              <div>

                <h2>
                  {
                    selectedChallan
                      .challanNumber
                  }
                </h2>

                <p>
                  Sales challan details
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedChallan(
                    null
                  )
                }
              >
                ×
              </button>

            </div>

            <div className="challan-summary">

              <div>

                <span>
                  Customer
                </span>

                <strong>
                  {
                    selectedChallan
                      .customer.name
                  }
                </strong>

              </div>

              <div>

                <span>
                  Status
                </span>

                <strong>
                  {
                    selectedChallan.status
                  }
                </strong>

              </div>

              <div>

                <span>
                  Total Quantity
                </span>

                <strong>
                  {
                    selectedChallan
                      .totalQuantity
                  }
                </strong>

              </div>

              <div>

                <span>
                  Created By
                </span>

                <strong>
                  {
                    selectedChallan
                      .createdBy
                      ?.name || "-"
                  }
                </strong>

              </div>

            </div>

            <div className="challan-detail-table">

              <h3>
                Products
              </h3>

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>
                      <th>
                        Product
                      </th>

                      <th>
                        SKU
                      </th>

                      <th>
                        Unit Price
                      </th>

                      <th>
                        Quantity
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {selectedChallan.items.map(
                      (item) => (

                        <tr
                          key={
                            item.id
                          }
                        >

                          <td>
                            {
                              item.productName
                            }
                          </td>

                          <td>
                            {item.sku}
                          </td>

                          <td>
                            ₹
                            {Number(
                              item.unitPrice
                            ).toLocaleString()}
                          </td>

                          <td>
                            {
                              item.quantity
                            }
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {selectedChallan.status ===
              "DRAFT" && (

              <div className="modal-actions">

                <button
                  className="secondary-button danger-button"
                  onClick={() =>
                    cancelChallan(
                      selectedChallan.id
                    )
                  }
                >
                  Cancel Challan
                </button>

                <button
                  className="primary-button"
                  onClick={() =>
                    confirmChallan(
                      selectedChallan.id
                    )
                  }
                >
                  Confirm Challan
                </button>

              </div>

            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default Challans;