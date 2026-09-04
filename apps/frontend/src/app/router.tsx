import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { CreateEventPage } from "@/features/events/pages/CreateEventPage";
import { EditEventPage } from "@/features/events/pages/EditEventPage";
import { EventDetailsPage } from "@/features/events/pages/EventDetailsPage";
import { EventsPage } from "@/features/events/pages/EventsPage";
import { CreateExcursionPage } from "@/features/excursions/pages/CreateExcursionPage";
import { ExcursionDetailsPage } from "@/features/excursions/pages/ExcursionDetailsPage";
import { ExcursionsPage } from "@/features/excursions/pages/ExcursionsPage";
import { CreateCustomerPage } from "@/features/customers/pages/CreateCustomerPage";
import { EditCustomerPage } from "@/features/customers/pages/EditCustomerPage";
import { CustomerDetailsPage } from "@/features/customers/pages/CustomerDetailsPage";
import { CustomersPage } from "@/features/customers/pages/CustomersPage";
import { CreateSupplierPage } from "@/features/suppliers/pages/CreateSupplierPage";
import { EditSupplierPage } from "@/features/suppliers/pages/EditSupplierPage";
import { SupplierDetailsPage } from "@/features/suppliers/pages/SupplierDetailsPage";
import { SuppliersPage } from "@/features/suppliers/pages/SuppliersPage";
import { CreateUserPage } from "@/features/users/pages/CreateUserPage";
import { EditUserPage } from "@/features/users/pages/EditUserPage";
import { UserDetailsPage } from "@/features/users/pages/UserDetailsPage";
import { UsersPage } from "@/features/users/pages/UsersPage";
import { CreateVehicleBookingPage } from "@/features/vehicleBookings/pages/CreateVehicleBookingPage";
import { VehicleBookingDetailsPage } from "@/features/vehicleBookings/pages/VehicleBookingDetailsPage";
import { VehicleBookingsPage } from "@/features/vehicleBookings/pages/VehicleBookingsPage";
import { BoardingPointDetailsPage } from "@/features/boardingPoints/pages/BoardingPointDetailsPage";
import { BoardingPointsPage } from "@/features/boardingPoints/pages/BoardingPointsPage";
import { CreateBoardingPointPage } from "@/features/boardingPoints/pages/CreateBoardingPointPage";
import { EditBoardingPointPage } from "@/features/boardingPoints/pages/EditBoardingPointPage";
import { CreateReservationPage } from "@/features/reservations/pages/CreateReservationPage";
import { ReservationDetailsPage } from "@/features/reservations/pages/ReservationDetailsPage";
import { ReservationsPage } from "@/features/reservations/pages/ReservationsPage";
import { CreatePaymentPage } from "@/features/payments/pages/CreatePaymentPage";
import { PaymentDetailsPage } from "@/features/payments/pages/PaymentDetailsPage";
import { PaymentsPage } from "@/features/payments/pages/PaymentsPage";
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
            <Route path="/events/:id/edit" element={<EditEventPage />} />

            <Route path="/excursions" element={<ExcursionsPage />} />
            <Route path="/excursions/new" element={<CreateExcursionPage />} />
            <Route path="/excursions/:id" element={<ExcursionDetailsPage />} />

            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/suppliers/new" element={<CreateSupplierPage />} />
            <Route path="/suppliers/:id" element={<SupplierDetailsPage />} />
            <Route
              path="/suppliers/:id/edit"
              element={<EditSupplierPage />}
            />

            <Route
              path="/passengers/:id/edit"
              element={<EditCustomerPage />}
            />

            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/new" element={<CreateUserPage />} />
            <Route path="/users/:id" element={<UserDetailsPage />} />
            <Route path="/users/:id/edit" element={<EditUserPage />} />

            <Route path="/vehicles/new" element={<CreateVehicleBookingPage />} />

            <Route
              path="/boarding-points/new"
              element={<CreateBoardingPointPage />}
            />
            <Route
              path="/boarding-points/:id/edit"
              element={<EditBoardingPointPage />}
            />
          </Route>

          <Route path="/vehicles" element={<VehicleBookingsPage />} />
          <Route path="/vehicles/:id" element={<VehicleBookingDetailsPage />} />

          <Route path="/boarding-points" element={<BoardingPointsPage />} />
          <Route
            path="/boarding-points/:id"
            element={<BoardingPointDetailsPage />}
          />

          <Route path="/passengers" element={<CustomersPage />} />
          <Route path="/passengers/new" element={<CreateCustomerPage />} />
          <Route path="/passengers/:id" element={<CustomerDetailsPage />} />

          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/reservations/new" element={<CreateReservationPage />} />
          <Route
            path="/reservations/:id"
            element={<ReservationDetailsPage />}
          />

          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/payments/new" element={<CreatePaymentPage />} />
          <Route path="/payments/:id" element={<PaymentDetailsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
