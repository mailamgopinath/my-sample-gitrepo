import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:8000/api/students";
const EMPTY_STUDENT = { name: "", email: "", course: "" };

function Student() {
    const [student, setStudent] = useState(EMPTY_STUDENT);
    const [students, setStudents] = useState(null);
    const [editId, setEditId] = useState(null);
    const [inputError, setInputError] = useState({});
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const studentList = students || [];

    const showError = (error, fallback) => {
        setMessage(error.response?.data?.message || fallback);
        setMessageType("error");
    };

    const handleFetch = async () => {
        try {
            const response = await axios.get(API, { withCredentials: true });
            setStudents(response.data.data);
        } catch (error) {
            showError(error, "Unable to load student records. Please try again.");
            setStudents([]);
        }
    };

    useEffect(() => {
        handleFetch();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setStudent((current) => ({ ...current, [name]: value }));
        setInputError((current) => ({ ...current, [name]: "" }));
        setMessage("");
    };

    const resetForm = () => {
        setStudent(EMPTY_STUDENT);
        setEditId(null);
        setInputError({});
        setMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const errors = {};

        if (!student.name.trim()) {
            errors.name = "Enter the student's name.";
        } else if (student.name.trim().length < 5) {
            errors.name = "Name must be at least 5 characters.";
        }
        if (!student.email.trim()) {
            errors.email = "Enter the student's email address.";
        }
        if (!student.course.trim()) {
            errors.course = "Enter a course name.";
        } else if (student.course.trim().length < 3) {
            errors.course = "Course name must be at least 3 characters.";
        }

        setInputError(errors);
        if (Object.keys(errors).length > 0) return;

        setIsSubmitting(true);
        setMessage("");
        try {
            const payload = {
                name: student.name.trim(),
                email: student.email.trim(),
                course: student.course.trim()
            };
            const response = editId !== null
                ? await axios.put(`${API}/${editId}`, payload, { withCredentials: true })
                : await axios.post(API, payload, { withCredentials: true });

            setMessage(response.data.message);
            setMessageType("success");
            setStudent(EMPTY_STUDENT);
            setEditId(null);
            setInputError({});
            await handleFetch();
        } catch (error) {
            showError(error, "Unable to save this student. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (item) => {
        setStudent({ name: item.name, email: item.email, course: item.course });
        setEditId(item.id);
        setInputError({});
        setMessage("");
        document.getElementById("student-name")?.focus();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this student record? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await axios.delete(`${API}/${id}`, { withCredentials: true });
            if (editId === id) resetForm();
            await handleFetch();
            setMessage(response.data.message);
            setMessageType("success");
        } catch (error) {
            showError(error, "Unable to delete this student. Please try again.");
        }
    };

    return (
        <main className="student-page">
            <header className="student-topbar">
                <Link className="brand-link" to="/dashboard">
                    <span className="brand-mark" aria-hidden="true">C</span>
                    <span>Campus Portal</span>
                </Link>
                <Link className="back-link" to="/dashboard">
                    <span aria-hidden="true">←</span> Back to dashboard
                </Link>
            </header>

            <section className="student-content">
                <div className="student-heading">
                    <div>
                        <span className="eyebrow">FACULTY WORKSPACE</span>
                        <h1>Student directory</h1>
                        <p>Keep student details organized and up to date.</p>
                    </div>
                    <div className="student-count">
                        <span className="count-icon" aria-hidden="true">S</span>
                        <span>                        <strong>{studentList.length}</strong><small>Student records</small></span>
                    </div>
                </div>

                <div className="student-layout">
                    <section className="panel student-form-panel" aria-labelledby="student-form-title">
                        <div className="panel-heading">
                            <span className="panel-icon" aria-hidden="true">{editId !== null ? "↻" : "+"}</span>
                            <div>
                                <h2 id="student-form-title">{editId !== null ? "Edit student" : "Add a student"}</h2>
                                <p>{editId !== null ? "Update the student information below." : "Enter the details to add a new record."}</p>
                            </div>
                        </div>

                        <form className="student-form" onSubmit={handleSubmit} noValidate>
                            <div className="field">
                                <label htmlFor="student-name">Full name</label>
                                <input
                                    id="student-name"
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Jamie Parker"
                                    value={student.name}
                                    onChange={handleChange}
                                    aria-invalid={Boolean(inputError.name)}
                                />
                                {inputError.name && <span className="field-error">{inputError.name}</span>}
                            </div>

                            <div className="field">
                                <label htmlFor="student-email">Email address</label>
                                <input
                                    id="student-email"
                                    type="email"
                                    name="email"
                                    placeholder="student@school.edu"
                                    value={student.email}
                                    onChange={handleChange}
                                    aria-invalid={Boolean(inputError.email)}
                                />
                                {inputError.email && <span className="field-error">{inputError.email}</span>}
                            </div>

                            <div className="field">
                                <label htmlFor="student-course">Course or program</label>
                                <input
                                    id="student-course"
                                    type="text"
                                    name="course"
                                    placeholder="e.g. Computer Science"
                                    value={student.course}
                                    onChange={handleChange}
                                    aria-invalid={Boolean(inputError.course)}
                                />
                                {inputError.course && <span className="field-error">{inputError.course}</span>}
                            </div>

                            {message && messageType === "success" && (
                                <p className={`form-message form-message--${messageType}`} role="status">
                                    {message}
                                </p>
                            )}

                            <div className="form-actions">
                                <button className="button button--primary" type="submit" disabled={isSubmitting}>
                                    {isSubmitting
                                        ? "Saving..."
                                        : editId !== null ? "Save changes" : "Add student"}
                                </button>
                                {editId !== null && (
                                    <button className="button button--secondary" type="button" onClick={resetForm}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </section>

                    <section className="panel directory-panel" aria-labelledby="directory-title">
                        <div className="panel-heading directory-heading">
                            <div>
                                <span className="eyebrow">YOUR CAMPUS</span>
                                <h2 id="directory-title">All students</h2>
                            </div>
                            <span className="record-pill">{studentList.length} {studentList.length === 1 ? "record" : "records"}</span>
                        </div>

                        {message && messageType === "error" && (
                            <p className="form-message form-message--error directory-error" role="alert">{message}</p>
                        )}

                        <div className="table-wrap">
                            <table className="student-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Student</th>
                                        <th scope="col">Email address</th>
                                        <th scope="col">Course</th>
                                        <th scope="col"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students === null ? (
                                        <tr>
                                            <td className="table-empty" colSpan="4">Loading student records...</td>
                                        </tr>
                                    ) : studentList.length === 0 ? (
                                        <tr>
                                            <td className="table-empty" colSpan="4">
                                                <span className="empty-icon" aria-hidden="true">✦</span>
                                                <strong>No students yet</strong>
                                                <span>Add a student using the form to get started.</span>
                                            </td>
                                        </tr>
                                    ) : studentList.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="student-name-cell">
                                                    <span className="student-avatar" aria-hidden="true">
                                                        {item.name.trim().charAt(0).toUpperCase()}
                                                    </span>
                                                    <span>{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="student-email-cell">{item.email}</td>
                                            <td><span className="course-tag">{item.course}</span></td>
                                            <td>
                                                <div className="row-actions">
                                                    <button
                                                        className="icon-button"
                                                        type="button"
                                                        onClick={() => handleEdit(item)}
                                                        aria-label={`Edit ${item.name}`}
                                                        title="Edit student"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="icon-button icon-button--danger"
                                                        type="button"
                                                        onClick={() => handleDelete(item.id)}
                                                        aria-label={`Delete ${item.name}`}
                                                        title="Delete student"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
                <footer className="page-footer">Campus Portal <span>·</span> Student records, made simple.</footer>
            </section>
        </main>
    );
}

export default Student;
