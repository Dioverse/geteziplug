// import React from "react";
// import Navbar from "../components/Navbar";
// import Topnav from "../components/Topnav";
// import Footer from "../components/Footer";


// export default function Notification() {
//   return (
//     <>
//       <div className="layout-wrapper layout-content-navbar">
//         <div className="layout-container">
//           {/* Menu */}
//           <Navbar />
//           {/* / Menu */}

//           {/* Layout container */}
//           <div className="layout-page">
//             {/* Navbar */}

//             <Topnav />

//             {/* / Navbar */}

//             {/* Content wrapper */}
//             <div className="content-wrapper">
//               {/* Content */}

//               <div className="container-xxl flex-grow-1 container-p-y">
//                 {/* <h4 class="fw-bold py-3 mb-4">
//                   <span class="text-muted fw-light">Home/</span> Terms &
//                   Conditions
//                 </h4> */}
//                 <h4 className="fw-bold py-3 mb-4">
//                   Terms & Conditions Management
//                 </h4>
//                 <p className="text-muted mb-4">
//                   Review the rules, responsibilities, and legal guidelines
//                   governing the use of this platform.
//                 </p>

//                 {/* <div className="row">
//                   <div className="col-lg-12 mb-4 order-0">
//                     <div className="card">
//                       <div className="card-header">
//                         <h5 className="mb-0">Terms & Conditions</h5>
//                         <section className="space-y-4 text-sm leading-relaxed">
//                           <p>
//                             By accessing and using this platform, you agree to
//                             comply with and be bound by the following terms and
//                             conditions.
//                           </p>

//                           <p>
//                             This service is provided on an “as is” basis. We
//                             reserve the right to modify or discontinue any part
//                             of the service without prior notice.
//                           </p>

//                           <p>
//                             Users are responsible for maintaining the
//                             confidentiality of their account credentials and all
//                             activities that occur under their account.
//                           </p>

//                           <p>
//                             Any attempt to abuse, exploit, or reverse engineer
//                             the platform will result in immediate account
//                             suspension.
//                           </p>
//                         </section>
//                       </div>
//                     </div>
//                   </div>
//                 </div> */}
//                 <div className="card">
//                   <div className="card-header">
//                     <h5 className="mb-0">Platform Terms & Conditions</h5>
//                   </div>

//                   <div className="card-body">
//                     <section className="mb-4">
//                       <h6 className="fw-bold">1. Acceptance of Terms</h6>
//                       <p className="text-sm">
//                         By accessing, registering, or using this platform, you
//                         confirm that you have read, understood, and agreed to be
//                         bound by these Terms and Conditions. If you do not
//                         agree, you must discontinue use immediately.
//                       </p>
//                     </section>

//                     <section className="mb-4">
//                       <h6 className="fw-bold">2. User Responsibilities</h6>
//                       <p className="text-sm">
//                         Users are responsible for maintaining the
//                         confidentiality of their account credentials and for all
//                         activities conducted under their account. Any
//                         unauthorized use must be reported immediately.
//                       </p>
//                     </section>

//                     <section className="mb-4">
//                       <h6 className="fw-bold">3. Service Availability</h6>
//                       <p className="text-sm">
//                         The platform is provided on an “as is” and “as
//                         available” basis. We do not guarantee uninterrupted
//                         access and reserve the right to modify, suspend, or
//                         discontinue any part of the service without prior
//                         notice.
//                       </p>
//                     </section>

//                     <section className="mb-4">
//                       <h6 className="fw-bold">4. Prohibited Activities</h6>
//                       <p className="text-sm">
//                         Users must not attempt to exploit, reverse engineer,
//                         manipulate, or abuse any part of the platform. Any such
//                         activity will result in immediate suspension or
//                         termination of the account.
//                       </p>
//                     </section>

//                     <section className="mb-4">
//                       <h6 className="fw-bold">5. Limitation of Liability</h6>
//                       <p className="text-sm">
//                         We shall not be held liable for any direct, indirect,
//                         incidental, or consequential damages arising from the
//                         use or inability to use the platform.
//                       </p>
//                     </section>

//                     <section>
//                       <h6 className="fw-bold">6. Changes to Terms</h6>
//                       <p className="text-sm">
//                         These Terms and Conditions may be updated at any time.
//                         Continued use of the platform after changes have been
//                         made constitutes acceptance of the revised terms.
//                       </p>
//                     </section>
//                   </div>
//                 </div>
//               </div>
//               {/* / Content */}

//               {/* Footer */}
//               <Footer />
//               {/* / Footer */}

//               <div className="content-backdrop fade"></div>
//             </div>
//             {/* Content wrapper */}
//           </div>
//           {/* / Layout page */}
//         </div>
//       </div>
//     </>
//   );
// }



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
