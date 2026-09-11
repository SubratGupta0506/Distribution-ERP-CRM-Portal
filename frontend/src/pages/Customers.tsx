import { FormEvent, useEffect, useState } from "react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

interface Customer {
  id: number;
  name: string;
  mobile: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  customerType: string;
  address?: string;
  status: string;
  followUpDate?: string;
  notes?: string;
  createdAt: string;
}

interface CustomerForm {
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber: string;
  customerType: string;
  address: string;
  status: string;
  followUpDate: string;
  notes: string;
}

const emptyForm: CustomerForm = {
  name: "",
  mobile: "",
  email: "",
  businessName: "",
  gstNumber: "",
  customerType: "RETAIL",
  address: "",
  status: "LEAD",
  followUpDate: "",
  notes: "",
};

const Customers = () => {
  const { user, token } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [customerType, setCustomerType] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,
          limit: 8,
          search: search || undefined,
          status: status || undefined,
          customerType: customerType || undefined,
        },
      });

      setCustomers(response.data.data);

      setTotalPages(
        response.data.pagination?.totalPages || 1
      );
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search, status, customerType, token]);

  const handleFormChange = (
    field: keyof CustomerForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openAddForm = () => {
    setEditingCustomer(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (customer: Customer) => {
    setEditingCustomer(customer);

    setForm({
      name: customer.name || "",
      mobile: customer.mobile || "",
      email: customer.email || "",
      businessName: customer.businessName || "",
      gstNumber: customer.gstNumber || "",
      customerType: customer.customerType || "RETAIL",
      address: customer.address || "",
      status: customer.status || "LEAD",
      followUpDate: customer.followUpDate
        ? customer.followUpDate.slice(0, 10)
        : "",
      notes: customer.notes || "",
    });

    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
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
        mobile: form.mobile,
        email: form.email || undefined,
        businessName: form.businessName || undefined,
        gstNumber: form.gstNumber || undefined,
        customerType: form.customerType,
        address: form.address || undefined,
        status: form.status,
        followUpDate: form.followUpDate
          ? new Date(form.followUpDate).toISOString()
          : undefined,
        notes: form.notes || undefined,
      };

      if (editingCustomer) {
        await api.put(
          `/customers/${editingCustomer.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await api.post(
          "/customers",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      closeForm();
      fetchCustomers();
    } catch (error: any) {
      setFormError(
        error.response?.data?.message ||
          "Failed to save customer"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handleTypeChange = (value: string) => {
    setCustomerType(value);
    setPage(1);
  };

  const formatDate = (date?: string) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="app-layout">

      <Sidebar />

      <main className="main-content">

        <header className="topbar">

          <div>
            <h1>Customers</h1>

            <p>
              Manage customer relationships and follow-ups
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
            placeholder="Search customers..."
            value={search}
            onChange={(event) =>
              handleSearchChange(event.target.value)
            }
          />

          <select
            value={status}
            onChange={(event) =>
              handleStatusChange(event.target.value)
            }
          >
            <option value="">All Status</option>
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            value={customerType}
            onChange={(event) =>
              handleTypeChange(event.target.value)
            }
          >
            <option value="">All Types</option>

            <option value="RETAIL">
              Retail
            </option>

            <option value="WHOLESALE">
              Wholesale
            </option>

            <option value="DISTRIBUTOR">
              Distributor
            </option>
          </select>

          <button
            className="primary-button"
            onClick={openAddForm}
          >
            + Add Customer
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
              Loading customers...
            </div>
          ) : customers.length === 0 ? (
            <div className="empty-state">
              No customers found.
            </div>
          ) : (
            <div className="table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Business</th>
                    <th>Mobile</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Follow-up</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {customers.map((customer) => (
                    <tr key={customer.id}>

                      <td>
                        <strong>
                          {customer.name}
                        </strong>
                      </td>

                      <td>
                        {customer.businessName || "-"}
                      </td>

                      <td>
                        {customer.mobile}
                      </td>

                      <td>
                        {customer.customerType}
                      </td>

                      <td>
                        <span
                          className={`status-badge customer-${customer.status.toLowerCase()}`}
                        >
                          {customer.status}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          customer.followUpDate
                        )}
                      </td>

                      <td>

                        <div className="table-actions">

                          <button
                            className="secondary-button"
                            onClick={() =>
                              setSelectedCustomer(customer)
                            }
                          >
                            View
                          </button>

                          <button
                            className="secondary-button"
                            onClick={() =>
                              openEditForm(customer)
                            }
                          >
                            Edit
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))}

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
                  {editingCustomer
                    ? "Edit Customer"
                    : "Add Customer"}
                </h2>

                <p>
                  Enter customer information
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
                  <label>Name *</label>

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
                  <label>Mobile *</label>

                  <input
                    type="text"
                    value={form.mobile}
                    onChange={(event) =>
                      handleFormChange(
                        "mobile",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      handleFormChange(
                        "email",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Business Name</label>

                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(event) =>
                      handleFormChange(
                        "businessName",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>GST Number</label>

                  <input
                    type="text"
                    value={form.gstNumber}
                    onChange={(event) =>
                      handleFormChange(
                        "gstNumber",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Customer Type *</label>

                  <select
                    value={form.customerType}
                    onChange={(event) =>
                      handleFormChange(
                        "customerType",
                        event.target.value
                      )
                    }
                  >
                    <option value="RETAIL">
                      Retail
                    </option>

                    <option value="WHOLESALE">
                      Wholesale
                    </option>

                    <option value="DISTRIBUTOR">
                      Distributor
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      handleFormChange(
                        "status",
                        event.target.value
                      )
                    }
                  >
                    <option value="LEAD">
                      Lead
                    </option>

                    <option value="ACTIVE">
                      Active
                    </option>

                    <option value="INACTIVE">
                      Inactive
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Follow-up Date</label>

                  <input
                    type="date"
                    value={form.followUpDate}
                    onChange={(event) =>
                      handleFormChange(
                        "followUpDate",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group full-width">
                  <label>Address</label>

                  <textarea
                    value={form.address}
                    onChange={(event) =>
                      handleFormChange(
                        "address",
                        event.target.value
                      )
                    }
                    rows={3}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>

                  <textarea
                    value={form.notes}
                    onChange={(event) =>
                      handleFormChange(
                        "notes",
                        event.target.value
                      )
                    }
                    rows={3}
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
                    : editingCustomer
                    ? "Update Customer"
                    : "Add Customer"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {selectedCustomer && (
        <div className="modal-overlay">

          <div className="modal-card detail-card">

            <div className="modal-header">

              <div>

                <h2>
                  {selectedCustomer.name}
                </h2>

                <p>
                  Customer details
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedCustomer(null)
                }
              >
                ×
              </button>

            </div>

            <div className="detail-grid">

              <div>
                <span>Mobile</span>

                <strong>
                  {selectedCustomer.mobile}
                </strong>
              </div>

              <div>
                <span>Email</span>

                <strong>
                  {selectedCustomer.email || "-"}
                </strong>
              </div>

              <div>
                <span>Business</span>

                <strong>
                  {selectedCustomer.businessName || "-"}
                </strong>
              </div>

              <div>
                <span>GST Number</span>

                <strong>
                  {selectedCustomer.gstNumber || "-"}
                </strong>
              </div>

              <div>
                <span>Customer Type</span>

                <strong>
                  {selectedCustomer.customerType}
                </strong>
              </div>

              <div>
                <span>Status</span>

                <strong>
                  {selectedCustomer.status}
                </strong>
              </div>

              <div>
                <span>Follow-up Date</span>

                <strong>
                  {formatDate(
                    selectedCustomer.followUpDate
                  )}
                </strong>
              </div>

              <div className="full-width">
                <span>Address</span>

                <strong>
                  {selectedCustomer.address || "-"}
                </strong>
              </div>

              <div className="full-width">
                <span>Notes</span>

                <strong>
                  {selectedCustomer.notes || "-"}
                </strong>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Customers;