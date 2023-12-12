import logo from './logo.svg';
import './App.css';
import {ColorModeContext, useMode} from "./theme";
import {CssBaseline, ThemeProvider} from "@mui/material";
import Topbar from "./pages/global/Topbar";
import Dashboard from "./pages/dashboard";
import Employees from "./pages/employees";
import Menu from './pages/menu';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Sidebar from "./pages/global/Sidebar";
import Restaurants from "./pages/restaurants";

function App() {

  const [theme, colorMode] = useMode();

  let isAdmin = localStorage.getItem("rl") === 'admin';

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar />
          <main className="content">
            <Topbar />
            <Routes>
              <Route path="/" element={isAdmin ? <Restaurants /> : <Dashboard/>}></Route>
              <Route path="/employees" element={<Employees/>}></Route>
              <Route path="/menu" element={<Menu/>}></Route>
              <Route path="/restaurants" element={<Restaurants/>}></Route>
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
