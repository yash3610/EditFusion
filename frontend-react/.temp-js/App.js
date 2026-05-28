import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import ProjectsPage from "@/pages/projects/page";
import PricingPage from "@/pages/pricing/page";
import ProfilePage from "@/pages/profile/page";
import LoginPage from "@/pages/login/page";
import RegisterPage from "@/pages/register/page";
function App() {
    return (_jsx(ThemeProvider, { attribute: "class", defaultTheme: "dark", enableSystem: true, children: _jsxs(AuthProvider, { children: [_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/image-editor", element: _jsx(ImageEditorPage, {}) }), _jsx(Route, { path: "/pdf-tools", element: _jsx(PdfToolsPage, {}) }), _jsx(Route, { path: "/converter", element: _jsx(ConverterPage, {}) }), _jsx(Route, { path: "/ai-tools", element: _jsx(AiToolsPage, {}) }), _jsx(Route, { path: "/projects", element: _jsx(ProjectsPage, {}) }), _jsx(Route, { path: "/pricing", element: _jsx(PricingPage, {}) }), _jsx(Route, { path: "/profile", element: _jsx(ProfilePage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "*", element: _jsx(HomePage, {}) })] }), _jsx(Toaster, {})] }) }));
}
export default App;
