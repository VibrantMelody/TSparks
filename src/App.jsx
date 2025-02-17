import { Box } from "@chakra-ui/react";
import { ColorModeButton } from "./components/ui/color-mode";
import "./index.css";
import { useState, lazy, Suspense } from "react";
import HRPage from "./pages/hrPage";

const LoginPage = lazy(() => import("./pages/loginPage.jsx"));
const EmployeePage = lazy(() => import("./pages/employeePage.jsx"));
const SignupPage = lazy(() => import("./pages/signupPage.jsx"));

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
      default:
        return null;
    }
  }

  return (
    <>
      <Box position="absolute" zIndex="max" top="1rem" right="1rem">
        <ColorModeButton />
      </Box>
      <Suspense fallback="">{showPage()}</Suspense>
    </>
  );
}

export default App;
