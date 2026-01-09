import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Topnav from "../components/Topnav";
import Footer from "../components/Footer";
import api from "../services/api";
import { toast } from "react-toastify";

export default function TermsCondition() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/termsandconditions")
      .then((res) => setContent(res.data.content))
      .catch(() => toast.error("Failed to load terms"));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put("/termsandconditions", { content });
      toast.success("Terms updated successfully");
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout-wrapper layout-content-navbar">
      <div className="layout-container">
        {/* Sidebar */}
        <Navbar />

        <div className="layout-page">
          {/* Top Navbar */}
          <Topnav />

          <div className="content-wrapper">
            <div className="container-xxl flex-grow-1 container-p-y">
              <h4 className="fw-bold py-3 mb-2">
                Terms & Conditions Management
              </h4>
              <p className="text-muted mb-4">
                Update the legal rules governing use of the platform.
              </p>

              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Edit Terms & Conditions</h5>
                </div>

                <div className="card-body">
                  <textarea
                    className="form-control mb-3"
                    rows={15}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />

                  <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>

            <Footer />
            <div className="content-backdrop fade"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
