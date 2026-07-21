import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { CreateEventPage } from "@/features/events/pages/CreateEventPage";
import { EventDetailsPage } from "@/features/events/pages/EventDetailsPage";
import { EventsPage } from "@/features/events/pages/EventsPage";
import { CreateExcursionPage } from "@/features/excursions/pages/CreateExcursionPage";
import { ExcursionDetailsPage } from "@/features/excursions/pages/ExcursionDetailsPage";
import { ExcursionsPage } from "@/features/excursions/pages/ExcursionsPage";
import { CreateCustomerPage } from "@/features/customers/pages/CreateCustomerPage";
import { CustomerDetailsPage } from "@/features/customers/pages/CustomerDetailsPage";
import { CustomersPage } from "@/features/customers/pages/CustomersPage";
import { CreateSupplierPage } from "@/features/suppliers/pages/CreateSupplierPage";
import { SupplierDetailsPage } from "@/features/suppliers/pages/SupplierDetailsPage";
import { SuppliersPage } from "@/features/suppliers/pages/SuppliersPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { AdminRoute } from "@/routes/AdminRoute";
import { PrivateRoute } from "@/routes/PrivateRoute";
import { PublicRoute } from "@/routes/PublicRoute";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/new" element={<CreateEventPage />} />
            <Route path="/events/:id" element={<EventDetailsPage />} />

            <Route path="/excursions" element={<ExcursionsPage />} />
            <Route path="/excursions/new" element={<CreateExcursionPage />} />
            <Route path="/excursions/:id" element={<ExcursionDetailsPage />} />

            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/suppliers/new" element={<CreateSupplierPage />} />
            <Route path="/suppliers/:id" element={<SupplierDetailsPage />} />
          </Route>

          <Route path="/passengers" element={<CustomersPage />} />
          <Route path="/passengers/new" element={<CreateCustomerPage />} />
          <Route path="/passengers/:id" element={<CustomerDetailsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
