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
function App() {
    return (<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />}/>
          <Route path="/dashboard" element={<DashboardPage />}/>
          <Route path="/image-editor" element={<ImageEditorPage />}/>
          <Route path="/pdf-tools" element={<PdfToolsPage />}/>
          <Route path="/converter" element={<ConverterPage />}/>
          <Route path="/ai-tools" element={<AiToolsPage />}/>
          <Route path="/compression" element={<CompressionPage />}/>
          <Route path="/projects" element={<ProjectsPage />}/>
          <Route path="/pricing" element={<PricingPage />}/>
          <Route path="/profile" element={<ProfilePage />}/>
          <Route path="/login" element={<LoginPage />}/>
          <Route path="/register" element={<RegisterPage />}/>
          <Route path="*" element={<HomePage />}/>
        </Routes>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>);
}
export default App;
