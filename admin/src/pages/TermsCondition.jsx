import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Topnav from "../components/Topnav";
import Footer from "../components/Footer";
import { getRequest, postRequest, putRequest } from "../services/apiServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function TermsCondition() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("Eziplug Terms and Conditions");
  const [version, setVersion] = useState("1.0");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [existingDocument, setExistingDocument] = useState(null);
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    fetchTermsAndConditions();
  }, []);

  const fetchTermsAndConditions = async () => {
    setFetching(true);
    try {
      const res = await getRequest("/legal-documents/type/terms_and_conditions");
      console.log("Fetched terms:", res.data);

      // Check if document exists
      if (res.data) {
        const doc = res.data?.data;
        setExistingDocument(doc);
        setContent(doc.content || "");
        setTitle(doc.title || "Eziplug Terms and Conditions");
        setVersion(doc.version || "1.0");
        setIsActive(doc.is_active !== undefined ? doc.is_active : true);
        toast.info("Existing terms loaded");
      } else {
        // No existing document
        setExistingDocument(null);
        setContent("");
        toast.info("No existing terms found. You can create new terms.");
      }
    } catch (err) {
      console.error("Failed to load terms:", err);
      setExistingDocument(null);
      toast.warning("No existing terms found. You can create new terms.");
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!content.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    if (!title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    if (!version.trim()) {
      toast.error("Version cannot be empty");
      return;
    }

    setLoading(true);
    try {
      if (existingDocument && existingDocument.id) {
        // Update existing document
        const updatePayload = {
          title: title,
          content: content,
          version: version,
          is_active: isActive,
        };

        const res = await putRequest(
          `/legal-documents/${existingDocument.id}`,
          updatePayload
        );

        console.log("Update response:", res.data);
        toast.success("Terms & Conditions updated successfully");

        // Refresh to get updated data
        await fetchTermsAndConditions();
      } else {
        // Create new document
        const createPayload = {
          type: "terms_and_conditions",
          title: title,
          content: content,
          version: version,
          is_active: isActive,
        };

        const res = await postRequest("/legal-documents", createPayload);

        console.log("Create response:", res.data);
        toast.success("Terms & Conditions created successfully");

        // Refresh to get created data
        await fetchTermsAndConditions();
      }
    } catch (err) {
      console.error("Save failed:", err);
      toast.error(
        err.response?.data?.message || "Failed to save Terms & Conditions"
      );
    } finally {
      setLoading(false);
    }
  };

  const incrementVersion = () => {
    const versionParts = version.split(".");
    if (versionParts.length === 2) {
      const minor = parseInt(versionParts[1]) + 1;
      setVersion(`${versionParts[0]}.${minor}`);
    } else {
      setVersion("1.0");
    }
  };

  return (
    <>
      <div className="layout-wrapper layout-content-navbar">
        <div className="layout-container">
          <Navbar />

          <div className="layout-page">
            <Topnav />

            <div className="content-wrapper">
              <div className="container-xxl flex-grow-1 container-p-y">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 className="fw-bold mb-2">
                      <i className="bx bx-file-blank me-2"></i>
                      Terms & Conditions Management
                    </h4>
                    <p className="text-muted mb-0">
                      {existingDocument
                        ? "Update the legal terms governing use of the platform"
                        : "Create new terms and conditions for the platform"}
                    </p>
                  </div>
                  {existingDocument && (
                    <span className="badge bg-label-success">
                      Document ID: {existingDocument.id}
                    </span>
                  )}
                </div>

                {fetching ? (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                      <div
                        className="spinner-border text-primary mb-3"
                        role="status"
                        style={{ width: "3rem", height: "3rem" }}
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted">Loading terms and conditions...</p>
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    {/* Document Metadata Card */}
                    <div className="col-lg-4 mb-4">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-light">
                          <h5 className="mb-0">
                            <i className="bx bx-info-circle me-2"></i>
                            Document Information
                          </h5>
                        </div>
                        <div className="card-body">
                          {/* Title */}
                          <div className="mb-4">
                            <label className="form-label fw-semibold">
                              Document Title
                              <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              placeholder="e.g., Eziplug Terms and Conditions"
                            />
                          </div>

                          {/* Version */}
                          <div className="mb-4">
                            <label className="form-label fw-semibold">
                              Version Number
                              <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control"
                                value={version}
                                onChange={(e) => setVersion(e.target.value)}
                                placeholder="e.g., 1.0"
                              />
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={incrementVersion}
                                title="Increment version"
                              >
                                <i className="bx bx-plus"></i>
                              </button>
                            </div>
                            <small className="text-muted">
                              Click + to auto-increment minor version
                            </small>
                          </div>

                          {/* Active Status */}
                          <div className="mb-4">
                            <label className="form-label fw-semibold">Status</label>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                id="activeSwitch"
                              />
                              <label
                                className="form-check-label"
                                htmlFor="activeSwitch"
                              >
                                {isActive ? (
                                  <span className="badge bg-success">Active</span>
                                ) : (
                                  <span className="badge bg-secondary">Inactive</span>
                                )}
                              </label>
                            </div>
                            <small className="text-muted">
                              Only active documents are visible to users
                            </small>
                          </div>

                          {/* Document Stats */}
                          {existingDocument && (
                            <div className="border-top pt-3">
                              <h6 className="fw-semibold mb-3">Document Stats</h6>
                              <div className="d-flex flex-column gap-2">
                                <div className="d-flex justify-content-between">
                                  <span className="text-muted small">Created:</span>
                                  <span className="small">
                                    {new Date(
                                      existingDocument.created_at
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                                {existingDocument.updated_at && (
                                  <div className="d-flex justify-content-between">
                                    <span className="text-muted small">
                                      Last Updated:
                                    </span>
                                    <span className="small">
                                      {new Date(
                                        existingDocument.updated_at
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                  </div>
                                )}
                                <div className="d-flex justify-content-between">
                                  <span className="text-muted small">
                                    Content Length:
                                  </span>
                                  <span className="small">
                                    {content.length.toLocaleString()} chars
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Action Note */}
                          <div className="alert alert-info mt-4 mb-0">
                            <i className="bx bx-info-circle me-2"></i>
                            <small>
                              {existingDocument
                                ? "Saving will update the existing document"
                                : "Saving will create a new document"}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Editor Card */}
                    <div className="col-lg-8 mb-4">
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">
                            <i className="bx bx-edit me-2"></i>
                            Content Editor
                          </h5>
                          {editorReady && (
                            <span className="badge bg-label-success">
                              <i className="bx bx-check-circle"></i> Editor Ready
                            </span>
                          )}
                        </div>

                        <div className="card-body">
                          <div className="mb-3">
                            <CKEditor
                              editor={ClassicEditor}
                              data={content}
                              onReady={(editor) => {
                                console.log("CKEditor is ready", editor);
                                setEditorReady(true);
                              }}
                              onChange={(event, editor) => {
                                const data = editor.getData();
                                setContent(data);
                              }}
                              config={{
                                toolbar: [
                                  "heading",
                                  "|",
                                  "bold",
                                  "italic",
                                  "link",
                                  "bulletedList",
                                  "numberedList",
                                  "|",
                                  "blockQuote",
                                  "insertTable",
                                  "|",
                                  "undo",
                                  "redo",
                                ],
                                placeholder:
                                  "Enter your terms and conditions content here...",
                              }}
                            />
                          </div>

                          <div className="d-flex justify-content-between align-items-center mt-4">
                            <div>
                              <small className="text-muted">
                                <i className="bx bx-info-circle me-1"></i>
                                Use the toolbar above to format your content
                              </small>
                            </div>

                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-outline-secondary"
                                onClick={fetchTermsAndConditions}
                                disabled={loading}
                              >
                                <i className="bx bx-refresh me-1"></i>
                                Refresh
                              </button>

                              <button
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={loading || !editorReady}
                              >
                                {loading ? (
                                  <>
                                    <span
                                      className="spinner-border spinner-border-sm me-2"
                                      role="status"
                                      aria-hidden="true"
                                    ></span>
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <i className="bx bx-save me-1"></i>
                                    {existingDocument
                                      ? "Update Terms"
                                      : "Create Terms"}
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Preview Card */}
                      {content && (
                        <div className="card border-0 shadow-sm mt-4">
                          <div className="card-header bg-light">
                            <h5 className="mb-0">
                              <i className="bx bx-show me-2"></i>
                              Content Preview
                            </h5>
                          </div>
                          <div
                            className="card-body"
                            style={{
                              maxHeight: "400px",
                              overflowY: "auto",
                            }}
                          >
                            <div
                              dangerouslySetInnerHTML={{ __html: content }}
                              style={{
                                lineHeight: "1.6",
                                color: "#333",
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Footer />
              <div className="content-backdrop fade"></div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}