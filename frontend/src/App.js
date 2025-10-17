/* apps/frontend/src/App.js */
import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useLocation } from "react-router-dom";
// Guards
import RequireAuth from "./components/guards/RequireAuth";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import BuyerLayout from "./layouts/BuyerLayout";
import AgentLayout from "./layouts/AgentLayout";

import Home from "./pages/Home/Home";
import NotFound from "./pages/NotFound/NotFound";

// Auth Pages
import FarmerLogin from "./pages/Auth/FarmerLogin/FarmerLogin";
import FarmerRegister from "./pages/Auth/FarmerRegister/FarmerRegister";
import BuyerLogin from "./pages/Auth/BuyerLogin/BuyerLogin";
import BuyerRegister from "./pages/Auth/BuyerRegister/BuyerRegister";
import AgentLogin from "./pages/Auth/AgentLogin/AgentLogin";
import AdminLogin from "./pages/Auth/AdminLogin/AdminLogin";

// Farmer Section
import FarmerDashboard from "./pages/Farmer/Dashboard/FarmerDashboard";
import FarmerCrops from "./pages/Farmer/Crops/FarmerCrops";
import HarvestList from "./pages/Farmer/Harvest/HarvestList";
import CropDetailsView from "./pages/Farmer/Crops/CropDetailsView";
import CropDetails from "./pages/Farmer/Marketplace/CropDetails";
import ExpenseTracker from "./pages/Farmer/ExpenseTracker/ExpenseTracker";
import FarmerMarketplace from "./pages/Farmer/Marketplace/FarmerMarketplace";
import FarmerProfile from "./pages/Farmer/Profile/FarmerProfile";
import CropRecords from "./pages/Farmer/Harvest/CropRecords";

// Buyer Section
import BuyerDashboard from "./pages/Buyer/Dashboard/BuyerDashboard";
import Marketplace from "./pages/Buyer/Marketplace/Marketplace";
import CropPurchase from "./pages/Buyer/CropPurchase/CropPurchase";
import MyOrders from "./pages/Buyer/Orders/MyOrders";
import Profile from "./pages/Buyer/Profile/Profile";

// Agent Section
// Agent Section
import AgentDashboard from "./pages/Agent/Dashboard/AgentDashboard";
import AgentFarmers from "./pages/Agent/Farmers/FarmersPage";
import AgentOrders from "./pages/Agent/Orders/AgentOrders";
import AgentProfile from "./pages/Agent/Profile/AgentProfile";
import AgentMarketplace from  "./pages/Agent/Marketplace/AgentMarketplace"
import AgentPayments from "./pages/Agent/Orders/AgentPayments";


// Admin Section
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import ManageFarmers from "./pages/Admin/Users/ManageFarmers";
import ManageBuyers from "./pages/Admin/Users/ManageBuyers";
import ManageAgents from "./pages/Admin/Users/ManageAgents";
import ManageOrders from "./pages/Admin/Orders/ManageOrders";
import ManageProducts from "./pages/Admin/Products/ManageProducts";
import ManagePayments from "./pages/Admin/Payments/ManagePayments";


function App() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/admin");

  return (
    <>
     {!hideNavbar}
      <Navbar />
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/farmer/login" element={<FarmerLogin />} />
        <Route path="/farmer/register" element={<FarmerRegister />} />
        <Route path="/buyer/login" element={<BuyerLogin />} />
        <Route path="/buyer/register" element={<BuyerRegister />} />
        <Route path="/agent/login" element={<AgentLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Farmer Protected Routes */}
        <Route
          path="/farmer/dashboard"
          element={
            <RequireAuth allowedRoles={["farmer"]} redirectTo="/farmer/login">
              <FarmerDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/farmer/crops"
          element={
            <RequireAuth allowedRoles={["farmer"]} redirectTo="/farmer/login">
              <FarmerCrops />
            </RequireAuth>
          }
        />
        <Route
          path="/farmer/harvest"
          element={
            <RequireAuth allowedRoles={["farmer"]} redirectTo="/farmer/login">
              <HarvestList />
            </RequireAuth>
          }
        />
        <Route
          path="/farmer/crop-details/:id"
          element={
            <RequireAuth allowedRoles={["farmer"]} redirectTo="/farmer/login">
              <CropDetailsView />
            </RequireAuth>
          }
        />
        <Route
          path="/farmer/expenses"
          element={
            <RequireAuth allowedRoles={["farmer"]} redirectTo="/farmer/login">
              <ExpenseTracker />
            </RequireAuth>
          }
        />
        <Route
          path="/farmer/marketplace"
          element={
            <RequireAuth allowedRoles={["farmer"]} redirectTo="/farmer/login">
              <FarmerMarketplace />
            </RequireAuth>
          }
        />
        <Route
          path="/farmer/marketplace/:id"
          element={
            <RequireAuth allowedRoles={["farmer"]} redirectTo="/farmer/login">
              <CropDetails />
            </RequireAuth>
          }
        />
        <Route
          path="/farmer/profile"
          element={
            <RequireAuth allowedRoles={["farmer"]} redirectTo="/farmer/login">
              <FarmerProfile />
            </RequireAuth>
          }
        />
        <Route
          path="/farmer/crop-records/:cropId"
          element={
            <RequireAuth allowedRoles={["farmer"]} redirectTo="/farmer/login">
              <CropRecords />
            </RequireAuth>
          }
        />

        {/* Buyer Protected Routes */}
        <Route
          path="/buyer/dashboard"
          element={
            <RequireAuth allowedRoles={["buyer"]} redirectTo="/buyer/login">
              <BuyerLayout>
                <BuyerDashboard />
              </BuyerLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/buyer/marketplace"
          element={
            <RequireAuth allowedRoles={["buyer"]} redirectTo="/buyer/login">
              <BuyerLayout>
                <Marketplace />
              </BuyerLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/buyer/marketplace/:id"
          element={
            <RequireAuth allowedRoles={["buyer"]} redirectTo="/buyer/login">
              <BuyerLayout>
                <CropPurchase />
              </BuyerLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/buyer/orders"
          element={
            <RequireAuth allowedRoles={["buyer"]} redirectTo="/buyer/login">
              <BuyerLayout>
                <MyOrders />
              </BuyerLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/buyer/profile"
          element={
            <RequireAuth allowedRoles={["buyer"]} redirectTo="/buyer/login">
              <BuyerLayout>
                <Profile />
              </BuyerLayout>
            </RequireAuth>
          }
        />


<Route
  path="/agent/dashboard"
  element={
    <RequireAuth allowedRoles={["agent"]} redirectTo="/agent/login">
      <AgentLayout>
        <AgentDashboard />
      </AgentLayout>
    </RequireAuth>
  }
/>
<Route
  path="/agent/farmers"
  element={
    <RequireAuth allowedRoles={["agent"]} redirectTo="/agent/login">
      <AgentLayout>
        <AgentFarmers />
      </AgentLayout>
    </RequireAuth>
  }
/>
<Route
  path="/agent/marketplace"
  element={
    <RequireAuth allowedRoles={["agent"]} redirectTo="/agent/login">
      <AgentLayout>
        <AgentMarketplace />
      </AgentLayout>
    </RequireAuth>
  }
/>
<Route
  path="/agent/orders"
  element={
    <RequireAuth allowedRoles={["agent"]} redirectTo="/agent/login">
      <AgentLayout>
        <AgentOrders />
      </AgentLayout>
    </RequireAuth>
  }
/>
<Route
  path="/agent/profile"
  element={
    <RequireAuth allowedRoles={["agent"]} redirectTo="/agent/login">
      <AgentLayout>
        <AgentProfile />
      </AgentLayout>
    </RequireAuth>
  }
/>

<Route
  path="/agent/payments"
  element={
    <RequireAuth allowedRoles={["agent"]} redirectTo="/agent/login">
      <AgentLayout>
        <AgentPayments />
      </AgentLayout>
    </RequireAuth>
  }
/>
       {/* ✅ Admin Protected Routes */}
<Route
  path="/admin/*"
  element={
    <RequireAuth allowedRoles={["admin"]} redirectTo="/admin/login">
      <AdminLayout />
    </RequireAuth>
  }
>
  <Route path="dashboard" element={<AdminDashboard />} />
  <Route path="users/farmers" element={<ManageFarmers />} />
  <Route path="users/buyers" element={<ManageBuyers />} />
  <Route path="users/agents" element={<ManageAgents />} />
  <Route path="orders" element={<ManageOrders />} />
  <Route path="products" element={<ManageProducts />} />
  <Route path="payments" element={<ManagePayments />} />
</Route>


<Route
  path="/agent/payments"
  element={
    <RequireAuth allowedRoles={["agent"]} redirectTo="/agent/login">
      <AgentLayout>
        <AgentPayments />
      </AgentLayout>
    </RequireAuth>
  }
/>
{/* ✅ Admin Protected Routes */}
<Route
  path="/admin/*"
  element={
    <RequireAuth allowedRoles={["admin"]} redirectTo="/admin/login">
      <AdminLayout />
    </RequireAuth>
  }
>
  <Route path="dashboard" element={<AdminDashboard />} />
  <Route path="users/farmers" element={<ManageFarmers />} />
  <Route path="users/buyers" element={<ManageBuyers />} />
  <Route path="users/agents" element={<ManageAgents />} />
  <Route path="orders" element={<ManageOrders />} />
  <Route path="products" element={<ManageProducts />} />
  <Route path="payments" element={<ManagePayments />} />
</Route>

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
