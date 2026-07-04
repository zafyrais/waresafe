// App.tsx
// Hanya berisi: state global, data fetching, auth logic, dan routing.
// Semua JSX per-page sudah dipindah ke src/pages/

import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import Sidebar from './components/layout/Sidebar.tsx';
import Login from './components/auth/Login.tsx';
import ForgotPass from './components/auth/ForgotPass.tsx';
import Register from './components/auth/Register.tsx';

import { loadDashboardData } from "./services/api";
import { login, logout } from "./services/authService";
import useClock from "./services/useClock";

// Pages
import Dashboard from './pages/Dashboard.tsx';
import Office from './pages/Office.tsx';
import Warehouse from './pages/Warehouse.tsx';
import Attacks from './pages/Attacks.tsx';
import Mitigation from './pages/Mitigation.tsx';
import Education from './pages/Education.tsx';

import type {
  SensorData,
  AlertData,
  AttackRecord,
  MitigationData,
} from './types.ts';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem('wareSafeLoggedIn') === 'true');
  const [activeEmail, setActiveEmail] = useState(
    () => localStorage.getItem('wareSafeEmail') || '');

  const [authPage, setAuthPage] = useState<'login' | 'forgot-password' | 'register'>('login');

  const [activePage, setActivePage] = useState('dashboard');

  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [officeSensors, setOfficeSensors] = useState<SensorData[]>([]);
  const [officeAlerts, setOfficeAlerts] = useState<AlertData[]>([]);
  const [warehouseDoor, setWarehouseDoor] = useState<SensorData[]>([]);
  const [warehouseSecurity, setWarehouseSecurity] = useState<SensorData[]>([]);
  const [warehouseRfid, setWarehouseRfid] = useState<SensorData[]>([]);
  const [warehouseAlerts, setWarehouseAlerts] = useState<AlertData[]>([]);
  const [attackRecords, setAttackRecords] = useState<AttackRecord[]>([]);
  const [mitigationData, setMitigationData] = useState<MitigationData[]>([]);

  const currentTime = useClock();

  // Fetch data & clock
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadDashboardData();

        setAlerts(data.alerts);
        setOfficeSensors(data.officeSensors);
        setOfficeAlerts(data.officeAlerts);
        setWarehouseDoor(data.warehouseDoor);
        setWarehouseSecurity(data.warehouseSecurity);
        setWarehouseRfid(data.warehouseRFID);
        setWarehouseAlerts(data.warehouseAlerts);
        setAttackRecords(data.attackHistory);
        setMitigationData(data.mitigation);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);
  
  // auth action
  const handleLogin = async (
    e: React.FormEvent,
    email: string,
    password: string
  ) => {
    e.preventDefault();

    try {
      const data = await login(email, password);

      if (data.success) {
        localStorage.setItem("wareSafeLoggedIn", "true");
        localStorage.setItem("wareSafeEmail", email);

        setActiveEmail(email);
        setIsLoggedIn(true);
      } else {
        alert("Login failed: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Could not connect to the server.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout(activeEmail);
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem("wareSafeLoggedIn");
      localStorage.removeItem("wareSafeEmail");

      setIsLoggedIn(false);
      setActiveEmail("");
      setActivePage("dashboard");
    }
  };

  // belum login
  if (!isLoggedIn) {
    switch (authPage) {
      case "login":
        return (
          <Login
            handleLogin={handleLogin}
            goToForgotPassword={() => setAuthPage("forgot-password")}
            goToRegister={() => setAuthPage("register")}
          />
        );

      case "forgot-password":
        return (
          <ForgotPass
            onBackToLogin={() => setAuthPage("login")}
          />
        );

      case "register":
        return (
          <Register
            onBackToLogin={() => setAuthPage("login")}
          />
        );

      default:
        return null;
    }
  }

  // udah login
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            currentTime={currentTime}
            officeSensors={officeSensors}
            warehouseDoor={warehouseDoor}
            totalAttackLogs={alerts.length}
          />
        );
      case 'office':
        return (
          <Office
            officeSensors={officeSensors}
            officeAlerts={officeAlerts}
          />
        );
      case 'warehouse':
        return (
          <Warehouse
            warehouseDoor={warehouseDoor}
            warehouseSecurity={warehouseSecurity}
            warehouseRfid={warehouseRfid}
            warehouseAlerts={warehouseAlerts}
          />
        );
      case 'attacks':
        return <Attacks attackRecords={attackRecords} />;
      case 'mitigation':
        return <Mitigation mitigationData={mitigationData} />;
      case 'education':
        return <Education />;
      default:
        return null;
    }
  };

  return (
    <div
      className="d-flex"
      style={{
        minHeight: "100vh",
        background: "#F5F7FB",
      }}
    >
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        handleLogout={handleLogout}
      />

      <main
        className="flex-grow-1"
        style={{
          padding: "30px",
          overflowY: "auto",
        }}
      >
        {renderPage()}
      </main>
    </div>
  );
}

export default App;