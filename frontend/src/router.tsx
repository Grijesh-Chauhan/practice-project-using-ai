import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/layout/AppLayout";
import { CreateTicketPage } from "./pages/CreateTicketPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { TicketListPage } from "./pages/TicketListPage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/tickets" replace />} />
        <Route path="tickets" element={<TicketListPage />} />
        <Route path="tickets/new" element={<CreateTicketPage />} />
        <Route path="tickets/:id" element={<TicketDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
