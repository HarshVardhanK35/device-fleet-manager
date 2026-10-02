import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    const response = await login({ email: email, password: password });

    if (response.token) {
      localStorage.setItem("token", response.token);
      navigate("/");
    } else {
      setError(response.message || "Login failed");
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        {error && <p>{error}</p>}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          type="email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />

        <button type="submit">Login</button>
      </form>
    </>
  );
}

export default Login;
