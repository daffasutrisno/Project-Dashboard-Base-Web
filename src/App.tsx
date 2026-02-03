import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Regional from "./pages/Forecast/Regional";
import Provinsi from "./pages/Forecast/Provinsi";
import Kabupaten from "./pages/Forecast/Kabupaten";
import FourG from "./pages/KPI/FourG";
import FiveG from "./pages/KPI/FiveG";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route
              index
              path="/"
              element={<Navigate to="/forecast-result/regional" replace />}
            />

            {/* KPI Monitoring Routes */}
            <Route path="/kpi-monitoring/4g" element={<FourG />} />
            <Route path="/kpi-monitoring/5g" element={<FiveG />} />

            {/* Forecast Result Routes */}
            <Route path="/forecast-result/regional" element={<Regional />} />
            <Route path="/forecast-result/provinsi" element={<Provinsi />} />
            <Route path="/forecast-result/kabupaten" element={<Kabupaten />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
