import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { UserProvider } from './contexts/UserContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/error/ErrorBoundary';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import InvoiceManagement from './pages/InvoiceManagement';
import FileManagement from './pages/FileManagement';
import StickyNote from './components/StickyNotes/StickyNotes';
import Settings from './components/settings/Settings';
import Feedback from './components/feedback/Feedback';
import Profile from './components/profile/Profile';
import Notifications from './pages/Notifications';
import ProductivityToolsPage from './pages/ProductivityToolsPage';
import { theme } from './config/theme';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CurrencyProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <UserProvider>
              <ProjectProvider>
                <Router>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/projects/:id" element={<ProjectDetails />} />
                      <Route path="/invoices" element={<InvoiceManagement />} />
                      <Route path="/files" element={<FileManagement />} />
                      <Route path="/notes" element={<StickyNote />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/feedback" element={<Feedback />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/productivity-tools" element={<ProductivityToolsPage />} />
                    </Routes>
                  </Layout>
                </Router>
              </ProjectProvider>
            </UserProvider>
          </ThemeProvider>
        </CurrencyProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
