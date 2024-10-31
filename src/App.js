import './App.css';
import {ColorModeContext, useMode} from "./theme";
import {CssBaseline, ThemeProvider} from "@mui/material";
import Topbar from "./pages/global/Topbar";
import Dashboard from "./pages/dashboard";
import Project from './pages/projects';
import {Route, Routes} from "react-router-dom";
import Sidebar from "./pages/global/Sidebar";
import Mocks from "./pages/mocks";
import Mappings from "./pages/mappings";
import ProjectMethod from "./pages/methods";
import MappingForm from "./pages/mappings/mappingForm";

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
              <Route path="/" element={isAdmin ? <Mocks /> : <Dashboard/>}></Route>
              <Route path="/projects" element={<Project/>}></Route>
              <Route path="/methods" element={<ProjectMethod />}></Route>
              <Route path="/mocks" element={<Mocks/>}></Route>
              <Route path="/mappings" element={<Mappings/>}></Route>
              <Route path="/mapping-form" element={<MappingForm/>}></Route>
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
