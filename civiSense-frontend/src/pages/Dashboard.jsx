import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const Dashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const response = await api.get("/complaint/");

                console.log("COMPLAINTS:", response.data);

                setComplaints(response.data.data || []);
            } catch (error) {
                console.error(
                    "FETCH COMPLAINTS ERROR:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to fetch complaints."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchComplaints();
    }, []);

    if (loading) {
        return (
            <main className="dashboard">
                <div className="dashboard-loading">
                    Loading your complaints...
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="dashboard">
                <div className="dashboard-header">
                    <div>
                        <p className="eyebrow">
                            CIVISENSE
                        </p>

                        <h1>Dashboard</h1>
                    </div>
                </div>

                <div className="error-message">
                    {error}
                </div>
            </main>
        );
    }

    const submittedCount = complaints.filter(
        (complaint) =>
            complaint.status === "submitted"
    ).length;

    const highUrgencyCount = complaints.filter(
        (complaint) =>
            complaint.urgency === "high"
    ).length;

    return (
        <main className="dashboard">

            {/* HEADER */}

            <div className="dashboard-header">

                <div>
                    <p className="eyebrow">
                        CIVISENSE
                    </p>

                    <h1>My Complaints</h1>

                    <p>
                        Track the civic issues you have
                        reported.
                    </p>
                </div>

                <Link
                    to="/complaints/create"
                    className="dashboard-button"
                >
                    + Report an Issue
                </Link>

            </div>

            {/* SUMMARY */}

            <div className="dashboard-stats">

                <div className="stat-card">
                    <span>
                        Total Complaints
                    </span>

                    <strong>
                        {complaints.length}
                    </strong>
                </div>

                <div className="stat-card">
                    <span>
                        Submitted
                    </span>

                    <strong>
                        {submittedCount}
                    </strong>
                </div>

                <div className="stat-card">
                    <span>
                        High Urgency
                    </span>

                    <strong>
                        {highUrgencyCount}
                    </strong>
                </div>

            </div>

            {/* COMPLAINTS */}

            {complaints.length === 0 ? (

                <div className="empty-state">

                    <div className="empty-icon">
                        +
                    </div>

                    <h2>
                        No complaints yet
                    </h2>

                    <p>
                        You haven't reported any civic
                        issues yet.
                    </p>

                    <Link
                        to="/complaints/create"
                        className="dashboard-button"
                    >
                        Report your first issue
                    </Link>

                </div>

            ) : (

                <section className="complaints-section">

                    <div className="section-title">

                        <div>
                            <p className="eyebrow">
                                ACTIVITY
                            </p>

                            <h2>
                                Recent Complaints
                            </h2>
                        </div>

                        <span>
                            {complaints.length} total
                        </span>

                    </div>

                    <div className="complaints-list">

                        {complaints.map(
                            (complaint) => (

                                <article
                                    className="complaint-card"
                                    key={complaint._id}
                                >

                                    {/* CARD HEADER */}

                                    <div className="complaint-card-header">

                                        <div>

                                            <h2>
                                                {complaint.title}
                                            </h2>

                                            <p className="complaint-date">
                                                {new Date(
                                                    complaint.createdAt
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    }
                                                )}
                                            </p>

                                        </div>

                                        <span
                                            className={`status ${complaint.status}`}
                                        >
                                            {complaint.status.replace(
                                                "_",
                                                " "
                                            )}
                                        </span>

                                    </div>

                                    {/* DESCRIPTION */}

                                    <p className="complaint-description">

                                        {complaint.description}

                                    </p>

                                    {/* META */}

                                    <div className="complaint-meta">

                                        <div>
                                            <span>
                                                Issue
                                            </span>

                                            <strong>
                                                {complaint.issueType ||
                                                    complaint.category}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Urgency
                                            </span>

                                            <strong
                                                className={`urgency-${complaint.urgency}`}
                                            >
                                                {complaint.urgency}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Location
                                            </span>

                                            <strong>
                                                {complaint.location
                                                    ?.city ||
                                                    "Unknown"}
                                            </strong>
                                        </div>

                                    </div>

                                    {/* PORTALS */}

                                    <div className="complaint-footer">

                                        <span>
                                            {complaint.portals?.length ||
                                                0}{" "}
                                            government portal
                                            {complaint.portals?.length ===
                                            1
                                                ? ""
                                                : "s"}
                                            found
                                        </span>

                                        <Link
                                            to={`/complaints/${complaint._id}`}
                                            className="view-complaint"
                                        >
                                            View Details →
                                        </Link>

                                    </div>

                                </article>

                            )
                        )}

                    </div>

                </section>

            )}

        </main>
    );
};

export default Dashboard;