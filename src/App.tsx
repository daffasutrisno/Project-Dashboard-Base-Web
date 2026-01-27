import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Regional from "./pages/Forecast/Regional";
import Provinsi from "./pages/Forecast/Provinsi";
import Kabupaten from "./pages/Forecast/Kabupaten";

// 5G KPI Charts
import Availability5G from "./pages/KPI/FiveG/Availability5G";
import Accessibility5G from "./pages/KPI/FiveG/Accessibility5G";
import CDR5G from "./pages/KPI/FiveG/CDR5G";
import SgnbAddition5G from "./pages/KPI/FiveG/SgnbAddition5G";
import Traffic5G from "./pages/KPI/FiveG/Traffic5G";
import EUTvsDLThp5G from "./pages/KPI/FiveG/EUTvsDLThp5G";
import User5G from "./pages/KPI/FiveG/User5G";
import DLPRBUtil5G from "./pages/KPI/FiveG/DLPRBUtil5G";
import InterEsgNB5G from "./pages/KPI/FiveG/InterEsgNB5G";
import IntraEsgNB5G from "./pages/KPI/FiveG/IntraEsgNB5G";
import IntraSgNBIntrafreq5G from "./pages/KPI/FiveG/IntraSgNBIntrafreq5G";
import InterSgNBIntrafreq5G from "./pages/KPI/FiveG/InterSgNBIntrafreq5G";

// 4G KPI Charts
import Availability4G from "./pages/KPI/FourG/Availability4G";
import S1Failure4G from "./pages/KPI/FourG/S1Failure4G";
import RRCConn4G from "./pages/KPI/FourG/RRCConn4G";
import Traffic4G from "./pages/KPI/FourG/Traffic4G";
import EUTvsCells4G from "./pages/KPI/FourG/EUTvsCells4G";
import DLPRBUtil4G from "./pages/KPI/FourG/DLPRBUtil4G";
import CQI4G from "./pages/KPI/FourG/CQI4G";
import DLUserThp4G from "./pages/KPI/FourG/DLUserThp4G";
import TrafficStacked from "./pages/KPI/FourG/TrafficStacked";
import TrafficRatio from "./pages/KPI/FourG/TrafficRatio";
import RRCStacked from "./pages/KPI/FourG/RRCStacked";
import RRCRatio from "./pages/KPI/FourG/RRCRatio";

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

            {/* KPI Monitoring - 5G Routes */}
            <Route
              path="/kpi-monitoring/5g/availability"
              element={<Availability5G />}
            />
            <Route
              path="/kpi-monitoring/5g/accessibility"
              element={<Accessibility5G />}
            />
            <Route path="/kpi-monitoring/5g/cdr" element={<CDR5G />} />
            <Route
              path="/kpi-monitoring/5g/sgnb-addition"
              element={<SgnbAddition5G />}
            />
            <Route path="/kpi-monitoring/5g/traffic" element={<Traffic5G />} />
            <Route
              path="/kpi-monitoring/5g/eut-dl-thp"
              element={<EUTvsDLThp5G />}
            />
            <Route path="/kpi-monitoring/5g/user" element={<User5G />} />
            <Route
              path="/kpi-monitoring/5g/dl-prb-util"
              element={<DLPRBUtil5G />}
            />
            <Route
              path="/kpi-monitoring/5g/inter-esgnb"
              element={<InterEsgNB5G />}
            />
            <Route
              path="/kpi-monitoring/5g/intra-esgnb"
              element={<IntraEsgNB5G />}
            />
            <Route
              path="/kpi-monitoring/5g/intra-sgnb-intrafreq"
              element={<IntraSgNBIntrafreq5G />}
            />
            <Route
              path="/kpi-monitoring/5g/inter-sgnb-intrafreq"
              element={<InterSgNBIntrafreq5G />}
            />

            {/* KPI Monitoring - 4G Routes */}
            <Route
              path="/kpi-monitoring/4g/availability"
              element={<Availability4G />}
            />
            <Route
              path="/kpi-monitoring/4g/s1-failure"
              element={<S1Failure4G />}
            />
            <Route path="/kpi-monitoring/4g/rrc-conn" element={<RRCConn4G />} />
            <Route path="/kpi-monitoring/4g/traffic" element={<Traffic4G />} />
            <Route
              path="/kpi-monitoring/4g/eut-cells"
              element={<EUTvsCells4G />}
            />
            <Route
              path="/kpi-monitoring/4g/dl-prb-util"
              element={<DLPRBUtil4G />}
            />
            <Route path="/kpi-monitoring/4g/cqi" element={<CQI4G />} />
            <Route
              path="/kpi-monitoring/4g/dl-user-thp"
              element={<DLUserThp4G />}
            />
            <Route
              path="/kpi-monitoring/4g/traffic-stacked"
              element={<TrafficStacked />}
            />
            <Route
              path="/kpi-monitoring/4g/traffic-ratio"
              element={<TrafficRatio />}
            />
            <Route
              path="/kpi-monitoring/4g/rrc-stacked"
              element={<RRCStacked />}
            />
            <Route path="/kpi-monitoring/4g/rrc-ratio" element={<RRCRatio />} />

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
