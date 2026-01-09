import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import UserDetails from "../pages/UserDetails";
import AirtimeHistory from "../pages/history/AirtimeHistory";
import BillHistory from "../pages/history/BillHistory";
import CableHistory from "../pages/history/CableHistory";
import CryptoHistory from "../pages/history/CryptoHistory";
import GiftcardHistory from "../pages/history/GiftcardHistory";
import DataHistory from "../pages/history/DataHistory";
import Setting from "../pages/setting";
import Support from "../pages/Support";
import Notification from "../pages/Notification";
import Account from "../pages/Account";
import Profile from "../pages/Profile";
import { AuthProvider } from "../AuthContext";
import RequireAuth from "../components/RequireAuth";
import AirtimePricing from "../pages/pricing/AirtimePricing";
import CablePlan from "../pages/pricing/CablePlan";
import CryptoPlan from "../pages/pricing/CryptoPlan";
import GiftcardPlan from "../pages/pricing/GiftcardPlan";
import DataPlan from "../pages/pricing/DataPlan";

import GiftUserHistory from "../pages/history/GiftUserHistory";
import FundHistory from "../pages/history/FundHistory";
import AirtimeSwapHistory from "../pages/history/AirtimeSwapHistory"; 
import BonusManagement from "../pages/management/BonusManagement";
import PayoutManagement from "../pages/management/PayoutManagement.jsx";
import VirtualAccountManagement from "../pages/management/VirtualAccountManagement";
import CryptoAction from "../pages/management/CryptoAction.jsx";
import Leaderboards from "../pages/LeaderBoards";
import PushNotifications from "../pages/PushNotifications";
import TermsCondition from "../pages/TermsCondition";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/home" element={<RequireAuth adminonly={true}><Dashboard /> </RequireAuth>} />
          <Route path="/admin/users" element={<RequireAuth adminonly={true}><Users /></RequireAuth>} />
          <Route path="/admin/users/:id" element={<RequireAuth adminonly={true}><UserDetails /></RequireAuth>} />

          <Route path="/admin/pricing/airtime" element={<RequireAuth adminonly={true}><AirtimePricing /></RequireAuth>} />
          <Route path="/admin/pricing/cable" element={<RequireAuth adminonly={true}><CablePlan /></RequireAuth>} />
          <Route path="/admin/pricing/crypto" element={<RequireAuth adminonly={true}><CryptoPlan /></RequireAuth>} />
          <Route path="/admin/pricing/giftcards" element={<RequireAuth adminonly={true}><GiftcardPlan /></RequireAuth>} />
          <Route path="/admin/pricing/data" element={<RequireAuth adminonly={true}><DataPlan /></RequireAuth>} />

          <Route path="/admin/history/airtime" element={<RequireAuth adminonly={true}><AirtimeHistory /></RequireAuth>} />
          <Route path="/admin/history/bill" element={<RequireAuth adminonly={true}><BillHistory /></RequireAuth>} />
          <Route path="/admin/history/cable" element={<RequireAuth adminonly={true}><CableHistory /></RequireAuth>} />
          <Route path="/admin/history/crypto" element={<RequireAuth adminonly={true}><CryptoHistory /></RequireAuth>} />
          <Route path="/admin/history/giftcards" element={<RequireAuth adminonly={true}><GiftcardHistory /></RequireAuth>} />
          <Route path="/admin/history/data" element={<RequireAuth adminonly={true}><DataHistory /></RequireAuth>} />
          <Route path="/admin/history/giftuser" element={<RequireAuth adminonly={true}><GiftUserHistory /></RequireAuth>} />
          <Route path="/admin/history/fund" element={<RequireAuth adminonly={true}><FundHistory /></RequireAuth>} />
          <Route path="/admin/history/airtimeswap" element={<RequireAuth adminonly={true}><AirtimeSwapHistory /></RequireAuth>} />


          <Route path="/admin/management/bonuses" element={<RequireAuth adminonly={true}><BonusManagement /></RequireAuth>} />
          <Route path="/admin/management/payouts" element={<RequireAuth adminonly={true}><PayoutManagement /></RequireAuth>} />
          <Route path="/admin/management/virtual-accounts" element={<RequireAuth adminonly={true}><VirtualAccountManagement /></RequireAuth>} />
          <Route path="/admin/management/crypto-actions" element={<RequireAuth adminonly={true}><CryptoAction /></RequireAuth>} />


          <Route path="/admin/leaderboards" element={<RequireAuth adminonly={true}><Leaderboards /></RequireAuth>} />
          <Route path="/admin/push-notifications" element={<RequireAuth adminonly={true}><PushNotifications /></RequireAuth>} />
          <Route path="/admin/account" element={<RequireAuth adminonly={true}><Account /></RequireAuth>} />

          <Route path="/admin/setting" element={<RequireAuth adminonly={true}><Setting /></RequireAuth>} />
          <Route path="/admin/support" element={<RequireAuth adminonly={true}><Support /></RequireAuth>} />
          <Route path="/admin/notifications" element={<RequireAuth adminonly={true}><Notification /></RequireAuth>} />
          <Route path="/admin/termscondition" element={<RequireAuth adminonly={true}><TermsCondition /></RequireAuth>} />
          <Route path="/admin/profile" element={<RequireAuth adminonly={true}><Profile /></RequireAuth>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
