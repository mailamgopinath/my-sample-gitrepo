import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
    const [loginValue, setLoginValue] = useState({ email: "", password: "" });
    const [inputError, setInputError] = useState({});
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (event) => {
        const { name, value } = event.target;
        setLoginValue((current) => ({ ...current, [name]: value }));
        setInputError((current) => ({ ...current, [name]: "" }));
        setMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const errors = {};

        if (!loginValue.email.trim()) {
            errors.email = "Enter your email address.";
        }
        if (!loginValue.password.trim()) {
            errors.password = "Enter your password.";
        } else if (loginValue.password.length < 6) {
            errors.password = "Your password must be at least 6 characters.";
        }

        setInputError(errors);
        if (Object.keys(errors).length > 0) return;

        setIsSubmitting(true);
        setMessage("");
        try {
            await axios.post("http://localhost:8000/login", loginValue, {
                withCredentials: true
            });
            navigate("/dashboard", { replace: true });
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "We couldn't sign you in. Please check your connection and try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card" aria-labelledby="login-title">
                <div className="auth-brand">
                    <span className="brand-mark" aria-hidden="true">C</span>
                    <span>Campus Portal</span>
                </div>

                <div className="auth-intro">
                    <span className="eyebrow">WELCOME BACK</span>
                    <h1 id="login-title">Sign in to your account</h1>
                    <p>Manage your campus workspace with one simple login.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="field">
                        <label htmlFor="login-email">Email address</label>
                        <input
                            id="login-email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            placeholder="you@school.edu"
                            value={loginValue.email}
                            onChange={handleChange}
                            aria-invalid={Boolean(inputError.email)}
                            aria-describedby={inputError.email ? "login-email-error" : undefined}
                        />
                        {inputError.email && (
                            <span className="field-error" id="login-email-error">
                                {inputError.email}
                            </span>
                        )}
                    </div>

                    <div className="field">
                        <div className="field-heading">
                            <label htmlFor="login-password">Password</label>
                        </div>
                        <input
                            id="login-password"
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            value={loginValue.password}
                            onChange={handleChange}
                            aria-invalid={Boolean(inputError.password)}
                            aria-describedby={inputError.password ? "login-password-error" : undefined}
                        />
                        {inputError.password && (
                            <span className="field-error" id="login-password-error">
                                {inputError.password}
                            </span>
                        )}
                    </div>

                    {message && (
                        <p className="form-message form-message--error" role="alert">
                            {message}
                        </p>
                    )}

                    <button className="button button--primary button--full" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Signing in..." : "Sign in"}
                        {!isSubmitting && <span aria-hidden="true">→</span>}
                    </button>
                </form>

                <p className="auth-switch">
                    New to Campus Portal? <Link to="/register">Create an account</Link>
                </p>
                <p className="auth-note">Your account is protected and your information stays private.</p>
            </section>
            <aside className="auth-aside" aria-label="Campus Portal information">
                <div className="aside-orb aside-orb--one" />
                <div className="aside-orb aside-orb--two" />
                <div className="aside-content">
                    <span className="aside-label">CAMPUS, CONNECTED</span>
                    <h2>Everything your campus needs, in one place.</h2>
                    <p>A simpler way for faculty to keep student information organized and up to date.</p>
                    <div className="aside-footer">
                        <span className="aside-dot" />
                        Simple. Secure. Made for your campus.
                    </div>
                </div>
            </aside>
        </main>
    );
}

export default Login;
