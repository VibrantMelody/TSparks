import { Box } from "@chakra-ui/react";
import { Toaster, toaster } from "./components/ui/toaster";
import { ColorModeButton } from "./components/ui/color-mode";
import "./index.css";
import { useState, lazy, Suspense } from "react";

import LoginPage from "./pages/loginPage";
import SignupPage from "./pages/signupPage";
import HRPage from "./pages/hrPage";
import ManagementPage from "./pages/managementPage";
import EmployeePage from "./pages/employeePage";
import { addDocsToDb } from "./firebase";

function App() {
  const [displayPage, setDisplayPage] = useState({
    page: "Login",
    user: "",
  });

  //   mockdata.forEach((data) => {
  //     addDocsToDb("JobListings", data);
  //   });

  function showPage() {
    switch (displayPage.page) {
      case "Login":
        return <LoginPage setDisplayPage={setDisplayPage} />;
      case "Employee":
        return (
          <EmployeePage
            setDisplayPage={setDisplayPage}
            user={displayPage.user}
          />
        );
      case "SignUp":
        return <SignupPage setDisplayPage={setDisplayPage} />;
      case "HR Manager":
        return (
          <HRPage setDisplayPage={setDisplayPage} userID={displayPage.user} />
        );
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
      {/* <Suspense fallback="Loading">{showPage()}</Suspense> */}
      {showPage()}
      <Toaster />
    </>
  );
}

export default App;
