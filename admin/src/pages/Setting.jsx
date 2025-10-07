import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Topnav from "../components/Topnav";
import axios from "axios";
import NavLink from "../components/NavLink";
import api from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Setting() {
    const [settings, setSettings] = useState([])
    const [keyName, setKeyName] = useState('')
    const [value, setValue] = useState('')
    const [loading, setLoading] = useState(false)
    const [editing, setEditing] = useState(false)
    const [editingSetting, setEditingSetting] = useState(null)


    useEffect(() => {
        fetchExchangeRate();
        fetchSettings()
    }, []);


    const fetchExchangeRate = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/exchange-rate")
            console.log("Fetched users:", res);

        } catch (err) {
            console.error("Failed to fetch exchange rate:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        setLoading(true)
        try {
            const response = await api.get("/admin/settings")
            console.log(response);
            setSettings(response.data.results.data)

        } catch (error) {
            console.error("Failed to fetch settings:", err);
        }
        finally {
            setLoading(false)
        }
    }

    const handleAddNewSetting = async () => {
        setLoading(true)
        try {
            const result = await api.post('/admin/settings', {
                key: keyName,
                value: value
            })
            if (result.status === 200) {
                toast.success('Setting added successfully')
                console.log('Update Successful', result);
            }
        } catch (error) {
            console.error("Failed to add setting:", err);

        }
        finally {
            setLoading(false)
        }
    }

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            const result = await api.put(`/admin/settings/${editingSetting.id}`, {
                value: value
            });

            if (result.status === 200) {
                // Update the table in UI
                setSettings(prev =>
                    prev.map(s =>
                        s.id === editingSetting.id
                            ? { ...s, value: value }
                            : s
                    )
                );

                toast.success("Setting updated successfully");

                // close modal 
                const modalEl = document.getElementById("basicModal");
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();
            }
        } catch (err) {
            console.error("Failed to update setting:", err);
        } finally {
            setLoading(false);
        }
    }

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

                            <div className="container-xxl flex-grow-1 container-p-y">

                                <h4 class="fw-bold py-3 mb-4"><span class="text-muted fw-light">Home/</span> Setting</h4>

                                <div className="row">
                                    <div className="col-lg-12 mb-4 order-0">

                                        <div className="card">
                                            <div className="card-header">
                                                <h5 className="mb-0">System Configuration</h5>

                                                <div className="card-header-actions">
                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            {/* Float this to the right */}
                                                            <div className="float-end">
                                                                <button
                                                                    type="button"
                                                                    class="btn btn-primary"
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target="#basicModal"
                                                                    onClick={() => {
                                                                        setEditing(false);
                                                                        setEditingSetting(null);
                                                                        setKeyName("");
                                                                        setValue("");
                                                                    }}
                                                                >
                                                                    New
                                                                </button>
                                                            </div>
                                                            <div className="modal fade" id="basicModal" tabindex="-1" aria-hidden="true">
                                                                <div className="modal-dialog" role="document">
                                                                    <div className="modal-content">
                                                                        <div className="modal-header">
                                                                            <h5 className="modal-title" id="exampleModalLabel1">Setting</h5>
                                                                            <button
                                                                                type="button"
                                                                                className="btn-close"
                                                                                data-bs-dismiss="modal"
                                                                                aria-label="Close"
                                                                            ></button>
                                                                        </div>
                                                                        <div className="modal-body">
                                                                            <div className="row">
                                                                                <div className="col mb-3">
                                                                                    <label for="nameBasic" className="form-label">Name</label>
                                                                                    <input type="text" readOnly={editing} id="nameBasic" className="form-select" value={keyName} onChange={(e) => setKeyName(e.target.value)} />
                                                                                </div>
                                                                            </div>
                                                                            <div className="row g-2">
                                                                                <div className="col mb-0">
                                                                                    <label for="symbol" className="form-label">Value</label>
                                                                                    <input type="text" id="symbol" className="form-control" value={value} onChange={(e) => setValue(e.target.value)} />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="modal-footer">
                                                                            <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
                                                                                Close
                                                                            </button>
                                                                            <button type="button" onClick={editing ? handleSaveChanges : handleAddNewSetting} className="btn btn-primary">{loading ? 'Saving...' : 'Save Changes'}</button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>


                                            </div>
                                            <div className="d-flex align-items-end row">
                                                <div className="table-responsive text-nowrap">
                                                    <table className="table">
                                                        <thead>
                                                            <tr>
                                                                <th width="50">#</th>
                                                                <th>Setting</th>
                                                                <th>Value</th>
                                                                <th>Date</th>
                                                                <th>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody class="table-border-bottom-0">
                                                            {settings && settings.map((setting, index) => (
                                                                <tr key={setting.id || index}>
                                                                    <td>{setting.id}</td>
                                                                    <td>
                                                                        {setting.key}
                                                                    </td>
                                                                    <td>
                                                                        {setting.value}
                                                                    </td>
                                                                    <td><span class="badge bg-label-primary me-1">{new Date(setting.created_at).toLocaleString()}</span></td>
                                                                    <td>
                                                                        <div class="dropdown">
                                                                            <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                                                                <i class="bx bx-dots-vertical-rounded"></i>
                                                                            </button>
                                                                            <div class="dropdown-menu" data-bs-toggle="modal"
                                                                                data-bs-target="#basicModal">
                                                                                <a onClick={() => {
                                                                                    setEditing(true);
                                                                                    setEditingSetting(setting);
                                                                                    setKeyName(setting.key);
                                                                                    setValue(setting.value);
                                                                                }} class="dropdown-item" href="javascript:void(0);"
                                                                                ><i class="bx bx-edit-alt me-1"></i> Edit</a>
                                                                                <a class="dropdown-item" href="javascript:void(0);"
                                                                                ><i class="bx bx-trash me-1"></i> Delete</a>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                // <tr>
                                                                //     <td>2</td>
                                                                //     <td>
                                                                //         Paystack Wallet
                                                                //     </td>
                                                                //     <td>
                                                                //         1256878ghkyu76978
                                                                //     </td>
                                                                //     <td><span class="badge bg-label-primary me-1">Active</span></td>
                                                                //     <td>
                                                                //         <div class="dropdown">
                                                                //             <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                                                //                 <i class="bx bx-dots-vertical-rounded"></i>
                                                                //             </button>
                                                                //             <div class="dropdown-menu">
                                                                //                 <a class="dropdown-item" href="javascript:void(0);"
                                                                //                 ><i class="bx bx-edit-alt me-1"></i> Edit</a>
                                                                //                 <a class="dropdown-item" href="javascript:void(0);"
                                                                //                 ><i class="bx bx-trash me-1"></i> Delete</a>
                                                                //             </div>
                                                                //         </div>
                                                                //     </td>
                                                                // </tr>

                                                            ))}
                                                        </tbody>
                                                    </table>
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
                <ToastContainer
                                          position="top-center"
                                          autoClose={3000}
                                        />
            </div>
        </>
    );
}
