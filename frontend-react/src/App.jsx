import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/page";
import DashboardPage from "@/pages/dashboard/page";
import ImageEditorPage from "@/pages/image-editor/page";
import PdfToolsPage from "@/pages/pdf-tools/page";
import ConverterPage from "@/pages/converter/page";
import AiToolsPage from "@/pages/ai-tools/page";
import CompressionPage from "@/pages/compression/page";
import ProjectsPage from "@/pages/projects/page";
import PricingPage from "@/pages/pricing/page";
import ProfilePage from "@/pages/profile/page";
import LoginPage from "@/pages/login/page";
import RegisterPage from "@/pages/register/page";
import { ProtectedRoute } from "@/components/auth/protected-route";
function App() {
    return (<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>}/>
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}/>
          <Route path="/image-editor" element={<ProtectedRoute><ImageEditorPage /></ProtectedRoute>}/>
          <Route path="/pdf-tools" element={<ProtectedRoute><PdfToolsPage /></ProtectedRoute>}/>
          <Route path="/converter" element={<ProtectedRoute><ConverterPage /></ProtectedRoute>}/>
          <Route path="/ai-tools" element={<ProtectedRoute><AiToolsPage /></ProtectedRoute>}/>
          <Route path="/compression" element={<ProtectedRoute><CompressionPage /></ProtectedRoute>}/>
          <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>}/>
          <Route path="/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>}/>
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}/>
          <Route path="/login" element={<LoginPage />}/>
          <Route path="/register" element={<RegisterPage />}/>
          <Route path="*" element={<ProtectedRoute><HomePage /></ProtectedRoute>}/>
        </Routes>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>);
}
export default App;
