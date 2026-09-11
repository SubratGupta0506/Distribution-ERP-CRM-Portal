import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

type DemoRole = "ADMIN" | "SALES" | "WAREHOUSE" | "ACCOUNTS";

const demoAccounts: Record<
  DemoRole,
  {
    label: string;
    email: string;
    password: string;
  }
> = {
  ADMIN: {
    label: "Admin",
    email: "admin@fundstrom.com",
    password: "Admin@123",
  },

  SALES: {
    label: "Sales",
    email: "sales@fundstrom.com",
    password: "Sales@123",
  },

  WAREHOUSE: {
    label: "Warehouse",
    email: "warehouse@fundstrom.com",
    password: "Warehouse@123",
  },

  ACCOUNTS: {
    label: "Accounts",
    email: "accounts@fundstrom.com",
    password: "Accounts@123",
  },
};

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDemoRole = (role: DemoRole) => {
    const account = demoAccounts[role];

    setEmail(account.email);
    setPassword(account.password);
    setError("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <h1>Fundstrom</h1>
          <p>ERP Operations Portal</p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              value={email}
              placeholder="Enter your email"
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              value={password}
              placeholder="Enter your password"
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <div className="demo-accounts">

          <p className="demo-title">
            Demo Accounts
          </p>

          <p className="demo-subtitle">
            Select a role to fill the login details
          </p>

          <div className="demo-role-grid">

            <button
              type="button"
              onClick={() => handleDemoRole("ADMIN")}
              className="demo-role-button"
            >
              Admin
            </button>

            <button
              type="button"
              onClick={() => handleDemoRole("SALES")}
              className="demo-role-button"
            >
              Sales
            </button>

            <button
              type="button"
              onClick={() => handleDemoRole("WAREHOUSE")}
              className="demo-role-button"
            >
              Warehouse
            </button>

            <button
              type="button"
              onClick={() => handleDemoRole("ACCOUNTS")}
              className="demo-role-button"
            >
              Accounts
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;