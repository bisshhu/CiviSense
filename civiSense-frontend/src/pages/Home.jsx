import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Home = () => {
    const { user } = useAuth();

    return (
        <main className="home-page">

            {/* HERO */}

            <section className="hero-section">

                <div className="hero-content">

                    <p className="eyebrow">
                        CIVISENSE
                    </p>

                    <h1>
                        Report civic problems.
                        <br />
                        Find the right authority.
                    </h1>

                    <p className="hero-description">
                        CiviSense helps you report civic issues,
                        understand the problem using AI, and
                        discover relevant government portals
                        for your location.
                    </p>

                    <div className="hero-actions">

                        {user ? (
                            <>
                                <Link
                                    to="/complaints/create"
                                    className="primary-button"
                                >
                                    Report an Issue
                                </Link>

                                <Link
                                    to="/dashboard"
                                    className="secondary-button"
                                >
                                    View Dashboard
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/register"
                                    className="primary-button"
                                >
                                    Get Started
                                </Link>

                                <Link
                                    to="/login"
                                    className="secondary-button"
                                >
                                    Login
                                </Link>
                            </>
                        )}

                    </div>

                </div>

            </section>

            {/* HOW IT WORKS */}

            <section className="how-section">

                <div className="section-heading">

                    <p className="eyebrow">
                        HOW IT WORKS
                    </p>

                    <h2>
                        From complaint to authority.
                    </h2>

                    <p>
                        CiviSense simplifies the process of
                        reporting civic issues.
                    </p>

                </div>

                <div className="steps">

                    <div className="step">

                        <span className="step-number">
                            01
                        </span>

                        <h3>
                            Report
                        </h3>

                        <p>
                            Describe the civic problem,
                            upload an image, and share
                            your location.
                        </p>

                    </div>

                    <div className="step">

                        <span className="step-number">
                            02
                        </span>

                        <h3>
                            Analyze
                        </h3>

                        <p>
                            AI identifies the issue type
                            and estimates its urgency.
                        </p>

                    </div>

                    <div className="step">

                        <span className="step-number">
                            03
                        </span>

                        <h3>
                            Find the Portal
                        </h3>

                        <p>
                            CiviSense discovers relevant
                            government portals for your
                            location.
                        </p>

                    </div>

                </div>

            </section>

            {/* CTA */}

            <section className="home-cta">

                <p className="eyebrow">
                    CIVISENSE
                </p>

                <h2>
                    One complaint.
                    <br />
                    The right portal.
                </h2>

                <p>
                    Stop searching through government
                    websites to figure out where your
                    complaint belongs.
                </p>

                <Link
                    to={
                        user
                            ? "/complaints/create"
                            : "/register"
                    }
                    className="primary-button"
                >
                    {user
                        ? "Report an Issue"
                        : "Create an Account"}
                </Link>

            </section>

        </main>
    );
};

export default Home;