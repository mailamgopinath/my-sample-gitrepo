import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
    const [value, setValue] = useState({ name: "", email: "", password: "" });
    const [message, setMessage] = useState("");
    const [inputError, setInputError] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (event) => {
        const { name, value: inputValue } = event.target;
        setValue((current) => ({ ...current, [name]: inputValue }));
        setInputError((current) => ({ ...current, [name]: "" }));
        setMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const errors = {};

        if (!value.name.trim()) {
            errors.name = "Enter your name.";
        } else if (value.name.trim().length < 3) {
            errors.name = "Your name must be at least 3 characters.";
        }
        if (!value.email.trim()) {
            errors.email = "Enter your email address.";
        }
        if (!value.password.trim()) {
            errors.password = "Create a password.";
        } else if (value.password.length < 6) {
            errors.password = "Your password must be at least 6 characters.";
        }

        setInputError(errors);
        if (Object.keys(errors).length > 0) return;

        setIsSubmitting(true);
        setMessage("");
        try {
            const response = await axios.post("http://localhost:8000/register", {
                name: value.name.trim(),
                email: value.email.trim(),
                password: value.password
            });

            setMessage(response.data.message || "Your account has been created.");
            setValue({ name: "", email: "", password: "" });
            window.setTimeout(() => navigate("/", { replace: true }), 1400);
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "We couldn't create your account. Please check your connection and try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="auth-page auth-page--register">
            <section className="auth-card" aria-labelledby="register-title">
                <div className="auth-brand">
                    <span className="brand-mark" aria-hidden="true">C</span>
                    <span>Campus Portal</span>
                </div>

                <div className="auth-intro">
                    <span className="eyebrow">GET STARTED</span>
                    <h1 id="register-title">Create your account</h1>
                    <p>Join your campus workspace in just a few steps.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="field">
                        <label htmlFor="register-name">Full name</label>
                        <input
                            id="register-name"
                            type="text"
                            name="name"
                            autoComplete="name"
                            placeholder="e.g. Alex Morgan"
                            value={value.name}
                            onChange={handleChange}
                            aria-invalid={Boolean(inputError.name)}
                            aria-describedby={inputError.name ? "register-name-error" : undefined}
                        />
                        {inputError.name && (
                            <span className="field-error" id="register-name-error">{inputError.name}</span>
                        )}
                    </div>

                    <div className="field">
                        <label htmlFor="register-email">Email address</label>
                        <input
                            id="register-email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            placeholder="you@school.edu"
                            value={value.email}
                            onChange={handleChange}
                            aria-invalid={Boolean(inputError.email)}
                            aria-describedby={inputError.email ? "register-email-error" : undefined}
                        />
                        {inputError.email && (
                            <span className="field-error" id="register-email-error">{inputError.email}</span>
                        )}
                    </div>

                    <div className="field">
                        <label htmlFor="register-password">Password</label>
                        <input
                            id="register-password"
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            placeholder="At least 6 characters"
                            value={value.password}
                            onChange={handleChange}
                            aria-invalid={Boolean(inputError.password)}
                            aria-describedby={inputError.password ? "register-password-error" : undefined}
                        />
                        {inputError.password && (
                            <span className="field-error" id="register-password-error">{inputError.password}</span>
                        )}
                    </div>

                    <p className="role-note">
                        New accounts are created as student accounts. Faculty access is assigned by an administrator.
                    </p>

                    {message && (
                        <p className="form-message" role="status">{message}</p>
                    )}

                    <button className="button button--primary button--full" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating account..." : "Create account"}
                        {!isSubmitting && <span aria-hidden="true">→</span>}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account? <Link to="/">Sign in</Link>
                </p>
            </section>
            <aside className="auth-aside auth-aside--register" aria-label="Campus Portal information">
                <div className="aside-orb aside-orb--one" />
                <div className="aside-orb aside-orb--two" />
                <div className="aside-content">
                    <span className="aside-label">A BETTER WAY TO STAY IN SYNC</span>
                    <h2>Get your campus community moving together.</h2>
                    <p>One secure workspace for the people and information that keep learning on track.</p>
                    <div className="aside-footer">
                        <span className="aside-dot" />
                        Welcome to your campus workspace.
                    </div>
                </div>
            </aside>
        </main>
    );
}

export default Register;
