import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Topnav from "../components/Topnav";
import { useParams } from "react-router-dom";
import { getRequest } from "../services/apiServices";

export default function UserDetails() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [kyc, setKyc] = useState(null);
  const [documents, setDocuments] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getRequest(`/kycs/${id}`);
        const data = res.data.data;

        setUser(data.user);
        setKyc(data.kyc);
        setDocuments(data.documents?.current);
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      }
    };

    fetchUser();
  }, [id]);

  if (!user) return <p>Loading...</p>;

  return (
    <>
      <div className="layout-wrapper layout-content-navbar">
        <div className="layout-container">
          <Navbar />

          <div className="layout-page">
            <Topnav />

            <div className="content-wrapper">
              <div className="container flex-grow-1 container-p-y">
                <h4 className="fw-bold py-3 mb-4">
                  <span className="text-muted fw-light">Home /</span> User Details
                </h4>

                <div className="card p-4">
                  <h4>User Information</h4>
                  <p>
                    <strong>Name:</strong> {user.first_name} {user.last_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {user.phone}
                  </p>
                  <p>
                    <strong>Joined:</strong>{" "}
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>

                  <hr />

                  <h4>KYC Information</h4>
                  <p>
                    <strong>Tier:</strong> {kyc?.tier_label}
                  </p>
                  <p>
                    <strong>Status:</strong> {kyc?.status_label}
                  </p>
                  {kyc?.rejection_reason && (
                    <p className="text-danger">
                      <strong>Rejection Reason:</strong>{" "}
                      {kyc.rejection_reason}
                    </p>
                  )}

                  <hr />

                  <h4>KYC Documents</h4>

                  {documents?.idmean && (
                    <div className="mb-3">
                      <p>
                        <strong>ID (NIN):</strong>
                      </p>
                      <img
                        src={documents.idmean}
                        alt="NIN Document"
                        width="250"
                        className="img-thumbnail"
                      />
                    </div>
                  )}

                  {documents?.prove_of_address && (
                    <div className="mb-3">
                      <p>
                        <strong>Proof of Address:</strong>
                      </p>
                      <img
                        src={documents.prove_of_address}
                        alt="Proof of Address"
                        width="250"
                        className="img-thumbnail"
                      />
                    </div>
                  )}

                  {documents?.prove_of_fund && (
                    <div className="mb-3">
                      <p>
                        <strong>Proof of Fund:</strong>
                      </p>
                      <img
                        src={documents.prove_of_fund}
                        alt="Proof of Fund"
                        width="250"
                        className="img-thumbnail"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Footer />
              <div className="content-backdrop fade"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
