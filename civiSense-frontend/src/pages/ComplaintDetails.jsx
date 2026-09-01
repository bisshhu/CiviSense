import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

const ComplaintDetails = () => {
    const { complaintId } = useParams();

    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const handleCopyApplication = async () => {
        if (!complaint?.application) return;

        try {
            await navigator.clipboard.writeText(
                complaint.application
            );

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (error) {
            console.error("COPY APPLICATION ERROR:", error);
        }
    };
    useEffect(() => {
        const fetchComplaint = async () => {
            try {
                const response = await api.get(
                    `/complaint/${complaintId}`
                );

                console.log(
                    "COMPLAINT DETAILS:",
                    response.data
                );

                setComplaint(response.data.data);
            } catch (error) {
                console.error(
                    "FETCH COMPLAINT ERROR:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to fetch complaint."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchComplaint();
    }, [complaintId]);

    if (loading) {
        return (
            <main className="details-page">
                <h1>Loading complaint...</h1>
            </main>
        );
    }

    if (error) {
        return (
            <main className="details-page">
                <div className="error-message">
                    {error}
                </div>

                <Link to="/dashboard">
                    ← Back to Dashboard
                </Link>
            </main>
        );
    }

    if (!complaint) {
        return null;
    }

    return (
        <main className="details-page">

            <Link
                to="/dashboard"
                className="back-link"
            >
                ← Back to Dashboard
            </Link>

            <div className="details-card">

                {/* HEADER */}

                <div className="details-header">

                    <div>
                        <p className="eyebrow">
                            CIVIC COMPLAINT
                        </p>

                        <h1>{complaint.title}</h1>
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

                {/* IMAGE */}

                {complaint.image && (
                    <div className="complaint-image-container">
                        <img
                            src={complaint.image}
                            alt={complaint.title}
                            className="complaint-image"
                        />
                    </div>
                )}

                {/* DESCRIPTION */}

                <section className="details-section">

                    <h2>Description</h2>

                    <p>
                        {complaint.description}
                    </p>

                </section>
                {/* COMPLAINT APPLICATION */}

                <section className="details-section application-section">

                    <div className="application-header">

                        <div>
                            <p className="eyebrow">
                                READY TO SUBMIT
                            </p>

                            <h2>Complaint Application</h2>

                            <p className="application-subtitle">
                                Copy this application and paste it into
                                the appropriate government complaint portal.
                            </p>
                        </div>

                        <button
                            className={`copy-application-btn ${copied ? "copied" : ""
                                }`}
                            onClick={handleCopyApplication}
                        >
                            {copied
                                ? "✓ Copied"
                                : "📋 Copy Application"}
                        </button>

                    </div>

                    <div className="application-box">

                        <pre>
                            {complaint.application ||
                                "Complaint application is not available."}
                        </pre>

                    </div>

                </section>
                {/* AI ANALYSIS */}

                <section className="details-section">

                    <h2>AI Analysis</h2>

                    <div className="analysis-grid">

                        <div className="analysis-item">

                            <span>
                                Issue Type
                            </span>

                            <strong>
                                {complaint.issueType}
                            </strong>

                        </div>

                        <div className="analysis-item">

                            <span>
                                Urgency
                            </span>

                            <strong
                                className={`urgency-${complaint.urgency}`}
                            >
                                {complaint.urgency}
                            </strong>

                        </div>

                        <div className="analysis-item">

                            <span>
                                Category
                            </span>

                            <strong>
                                {complaint.category}
                            </strong>

                        </div>

                    </div>

                </section>

                {/* LOCATION */}

                <section className="details-section">

                    <h2>Location</h2>

                    <p>
                        {complaint.location?.address}
                    </p>

                    <div className="location-details">

                        <span>
                            {complaint.location?.area}
                        </span>

                        <span>
                            {complaint.location?.city}
                        </span>

                        <span>
                            {complaint.location?.district}
                        </span>

                        <span>
                            {complaint.location?.state}
                        </span>

                        <span>
                            {complaint.location?.postcode}
                        </span>

                    </div>

                    <a
                        href={`https://www.google.com/maps?q=${complaint.location?.latitude},${complaint.location?.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="map-link"
                    >
                        📍 View on Google Maps
                    </a>

                </section>

                {/* STATUS HISTORY */}

                <section className="details-section">

                    <h2>Status History</h2>

                    <div className="status-history">

                        {complaint.statusHistory?.map(
                            (item, index) => (
                                <div
                                    className="history-item"
                                    key={index}
                                >
                                    <div>
                                        <strong>
                                            {item.status.replace(
                                                "_",
                                                " "
                                            )}
                                        </strong>

                                        <p>
                                            {item.note}
                                        </p>
                                    </div>

                                    <span>
                                        {new Date(
                                            item.changedAt
                                        ).toLocaleDateString()}
                                    </span>

                                </div>
                            )
                        )}

                    </div>

                </section>

                {/* GOVERNMENT PORTALS */}

                <section className="details-section">

                    <h2>
                        Government Complaint Portals
                    </h2>

                    {complaint.portals?.length === 0 ? (
                        <p className="muted">
                            No government portals were
                            found for this complaint.
                        </p>
                    ) : (
                        <div className="portal-list">

                            {complaint.portals?.map(
                                (portal) => (
                                    <div
                                        className="portal-card"
                                        key={portal._id}
                                    >

                                        <h3>
                                            {portal.name}
                                        </h3>

                                        <p>
                                            {portal.description ||
                                                "Government grievance portal"}
                                        </p>

                                        <div className="portal-info">

                                            <span>
                                                {portal.department}
                                            </span>

                                            <span>
                                                {portal.verified
                                                    ? "✓ Verified"
                                                    : "Unverified"}
                                            </span>

                                        </div>

                                        <a
                                            href={portal.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="portal-link"
                                        >
                                            Visit Complaint Portal →
                                        </a>

                                    </div>
                                )
                            )}

                        </div>
                    )}

                </section>

            </div>

        </main>
    );
};

export default ComplaintDetails;