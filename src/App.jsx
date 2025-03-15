import { Box } from "@chakra-ui/react";
import { ColorModeButton } from "./components/ui/color-mode";
import "./index.css";
import { useState, lazy, Suspense } from "react";

const LoginPage = lazy(() => import("./pages/loginPage.jsx"));
const SignupPage = lazy(() => import("./pages/signupPage.jsx"));
const HRPage = lazy(() => import("./pages/hrPage.jsx"));
const ManagementPage = lazy(() => import("./pages/managementPage.jsx"));
const EmployeePage = lazy(() => import("./pages/employeePage.jsx"));

function App() {
  const [displayPage, setDisplayPage] = useState("Login");

  function showPage() {
    switch (displayPage) {
      case "Login":
        return <LoginPage setDisplayPage={setDisplayPage} />;
      case "Employee":
        return <EmployeePage setDisplayPage={setDisplayPage} />;
      case "SignUp":
        return <SignupPage setDisplayPage={setDisplayPage} />;
      case "HR Manager":
        return <HRPage setDisplayPage={setDisplayPage} />;
      case "Management":
        return <ManagementPage setDisplayPage={setDisplayPage} />;
      default:
        return null;
    }
  }

  return (
    <>
      <Box position="absolute" zIndex="max" top="1rem" right="1rem">
        <ColorModeButton />
      </Box>
      <Suspense fallback="....Loading">{showPage()}</Suspense>
    </>
  );
}

export default App;
