import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Topnav from "../components/Topnav";
import { useParams } from "react-router-dom";
import { getRequest } from "../services/apiServices";

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getRequest(`/kycs/${id}`);
        setUser(res.data.result.user);
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
                    {/* Menu */}
                    <Navbar />
                    {/* / Menu */}

                    {/* Layout container */}
                    <div className="layout-page">
                    {/* Navbar */}

                    <Topnav />

                    {/* / Navbar */}

                    {/* Content wrapper */}
                    <div className="content-wrapper">
                        {/* Content */}

                        <div className="container flex-grow-1 container-p-y">
                            <h4 class="fw-bold py-3 mb-4">
                                <span class="text-muted fw-light">Home /</span> User Details
                            </h4>

                            <div className="row">
                                <div className="col-lg-12 mb-4 order-0">
                                <div className="card">
                                    <div className="d-flex align-items-end row">
                                    <div className="container py-4">
                                        <h4>User & KYC Details</h4>
                                        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                        <p><strong>Email:</strong> {user.email}</p>
                                        <p><strong>Phone:</strong> {user.phone}</p>
                                        <p><strong>Address:</strong> {user.address} {user.state} {user.country}</p>
              

                                        <h5 className="mt-4">KYC Documents</h5>
                                        <div>
                                            {/* {user.kyc?.tier2 && ( */}
                                            {user.idmean && (
                                            <div>
                                                <p><strong>NIN:</strong></p>
                                                <img src={`https://cashpoint.deovaze.com/${user.idmean}`} alt="NIN" width="200" />
                                            </div>
                                            )}
                                            {user.prove_of_fund && (
                                            <div>
                                                <p><strong>Proof of Fund:</strong></p>
                                                <img src={user.prove_of_fund} alt="ProofOfFund" width="200" />
                                            </div>
                                            )}
                                            {user.prove_of_address && (
                                            <div>
                                                <p><strong>Proof of Address:</strong></p>
                                                <img src={`https://cashpoint.deovaze.com/storage/app/public/${user.kyc.tier3.prove_of_address}`} alt="ProofOfAddress" width="200" />
                                            </div>
                                            )}
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>
                            {/* / Content */}

                        
                            {/* Footer */}
                            <Footer />
                            {/* / Footer */}

                        <div className="content-backdrop fade"></div>
                    </div>
                    {/* Content wrapper */}
                </div>
                {/* / Layout page */}
            </div>
        </div>
    </>
  );
}
