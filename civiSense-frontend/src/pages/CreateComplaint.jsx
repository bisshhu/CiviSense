import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CreateComplaint = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
    });

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const [location, setLocation] = useState({
        latitude: null,
        longitude: null,
    });

    const [locationLoading, setLocationLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        // Only allow images
        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            return;
        }

        // 5 MB limit on frontend
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be smaller than 5 MB.");
            return;
        }

        setError("");
        setImage(file);

        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
    };

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError(
                "Geolocation is not supported by your browser."
            );
            return;
        }

        setLocationLoading(true);
        setError("");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });

                setLocationLoading(false);
            },
            (error) => {
                console.error(
                    "LOCATION ERROR:",
                    error
                );

                let message =
                    "Unable to get your location.";

                if (error.code === 1) {
                    message =
                        "Location permission was denied. Please allow location access.";
                }

                if (error.code === 2) {
                    message =
                        "Your location could not be determined.";
                }

                if (error.code === 3) {
                    message =
                        "Location request timed out. Please try again.";
                }

                setError(message);
                setLocationLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.title.trim()) {
            setError("Please enter a title.");
            return;
        }

        if (!formData.description.trim()) {
            setError("Please describe the problem.");
            return;
        }

        if (!formData.category) {
            setError("Please select a category.");
            return;
        }

        if (!image) {
            setError("Please upload an image.");
            return;
        }

        if (
            location.latitude === null ||
            location.longitude === null
        ) {
            setError(
                "Please capture your complaint location."
            );
            return;
        }

        const data = new FormData();

        data.append(
            "title",
            formData.title.trim()
        );

        data.append(
            "description",
            formData.description.trim()
        );

        data.append(
            "category",
            formData.category
        );

        data.append(
            "latitude",
            location.latitude
        );

        data.append(
            "longitude",
            location.longitude
        );

        data.append("image", image);

        setLoading(true);

        try {
            const response = await api.post(
                "/complaint/create-complaint",
                data
            );

            console.log(
                "COMPLAINT CREATED:",
                response.data
            );

            setSuccess(
                "Complaint submitted successfully!"
            );

            setTimeout(() => {
                navigate("/dashboard");
            }, 1200);

        } catch (error) {
            console.error(
                "CREATE COMPLAINT ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to submit complaint."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="create-complaint-page">

            <div className="complaint-form-card">

                <div className="form-heading">

                    <p className="eyebrow">
                        CIVISENSE
                    </p>

                    <h1>
                        Report a civic issue
                    </h1>

                    <p>
                        Tell us about the problem and
                        we'll help identify the appropriate
                        government portal.
                    </p>

                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <label>
                        Title
                    </label>

                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Example: Large pothole near MG Road"
                        disabled={loading}
                        required
                    />

                    <label>
                        Description
                    </label>

                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the problem..."
                        rows="6"
                        disabled={loading}
                        required
                    />

                    <label>
                        Category
                    </label>

                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        disabled={loading}
                        required
                    >
                        <option value="">
                            Select category
                        </option>

                        <option value="roads">
                            Roads
                        </option>

                        <option value="sanitation">
                            Sanitation
                        </option>

                        <option value="water">
                            Water
                        </option>

                        <option value="electricity">
                            Electricity
                        </option>

                        <option value="streetlight">
                            Streetlight
                        </option>

                        <option value="drainage">
                            Drainage
                        </option>

                        <option value="other">
                            Other
                        </option>
                    </select>

                    {/* IMAGE */}

                    <label>
                        Complaint Image
                    </label>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={loading}
                        required
                    />

                    {imagePreview && (
                        <div className="image-preview-container">

                            <img
                                src={imagePreview}
                                alt="Complaint preview"
                                className="image-preview"
                            />

                            <p>
                                {image.name}
                            </p>

                        </div>
                    )}

                    {/* LOCATION */}

                    <div className="location-section">

                        <label>
                            Complaint Location
                        </label>

                        <button
                            type="button"
                            className="location-button"
                            onClick={getLocation}
                            disabled={
                                locationLoading ||
                                loading
                            }
                        >
                            {locationLoading
                                ? "Getting location..."
                                : location.latitude !== null
                                    ? "✓ Location captured"
                                    : "📍 Use my current location"}
                        </button>

                        {location.latitude !== null && (
                            <p className="location-success">
                                Your location has been
                                captured successfully.
                            </p>
                        )}

                    </div>

                    {/* SUBMIT */}

                    <button
                        type="submit"
                        className="submit-complaint"
                        disabled={
                            loading ||
                            locationLoading
                        }
                    >
                        {loading
                            ? "Analyzing & submitting..."
                            : "Submit Complaint"}
                    </button>

                    {loading && (
                        <p className="submission-info">
                            Your complaint is being analyzed
                            and relevant government portals
                            are being identified. This may
                            take a few moments.
                        </p>
                    )}

                </form>

            </div>

        </main>
    );
};

export default CreateComplaint;