import { useState } from "react";
import logo from "../assets/images/logo/tsparks-high-resolution-logo-transparent-black-text.png";
import signupBackground from "../assets/images/michal-parzuchowski-lHkUBtUiI2Q-unsplash.jpg";
import {
  Text,
  Box,
  Flex,
  Image,
  Center,
  Input,
  Button,
  Separator,
  HStack,
  Stack,
} from "@chakra-ui/react";

import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogRoot,
} from "../components/ui/dialog";

import { SegmentedControl } from "../components/ui/segmented-control";
import { InputGroup } from "../components/ui/input-group";
import { LuExternalLink, LuUser } from "react-icons/lu";
import { Checkbox } from "../components/ui/checkbox";
import {
  PasswordInput,
  PasswordStrengthMeter,
} from "../components/ui/password-input";

import { createNewUser } from "../firebase";
import { Lock, Mail, User } from "lucide-react";

function SignupPage({ setDisplayPage }) {
  return (
    <Flex height="100vh" width="100vw">
      <Box
        width="49%"
        height="98%"
        margin="auto"
        padding="0"
        borderRadius="15px"
        shadow="2xl"
        bgImage={`linear-gradient(to top, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0)), url(${signupBackground})`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        position="relative"
      >
        <Text
          position="absolute"
          bottom="5%"
          left="50%"
          transform="translateX(-50%)"
          color="white"
          width="80%"
          textAlign="center"
        >
          "Great organizations are built on great people. Effective talent
          management isn't just about recruitment—it's about nurturing,
          developing, and inspiring individuals to reach their full potential.
          At TSPARK, we make sure talent doesn't just grow, but thrives."
        </Text>
      </Box>

      <Center axis="both" height="100%" width="50%">
        <SignupSection setDisplayPage={setDisplayPage} />
      </Center>
    </Flex>
  );
}

function SignupSection({ setDisplayPage }) {
  const [selectedRole, setSelectedRole] = useState("Employee");
  // const [password, setPassword] = useState("");
  // const [confirmPassword, setConfirmPassword] = useState("");
  // const [email, setEmail] = useState("");
  const [dialogTrigger, setDialogTrigger] = useState(false);

  let email,
    firstName,
    lastName,
    password = "",
    confirmPassword = "";
  const roles = ["Management", "HR Manager", "Employee"];

  async function handleSignUp() {
    if (password !== confirmPassword) {
      setDialogTrigger(true);
      return;
    }
    const signUp = await createNewUser(email, password, selectedRole);
    const status = signUp.status;
    const message = signUp.message;

    if (status == "success") {
      setDisplayPage("Login");
    } else {
      setDialogTrigger(true);
    }
  }

  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      gap="1.5rem"
      width="60%"
    >
      <Image src={logo} height="20%" width="20%"></Image>
      <Text textStyle="2xl" fontWeight="bold">
        Create your account
      </Text>
      <Text fontWeight="bold">Select your role</Text>
      <SegmentedControl
        size="lg"
        defaultValue={selectedRole}
        value={selectedRole}
        onValueChange={(e) => setSelectedRole(e.value)}
        items={["HR Manager", "Management", "Employee", "Upper Management"]}
      />
      <Separator width="80%" />

      <Stack width="90%" direction="row">
        <InputGroup flex="1" startElement={<User height="16px" />}>
          <Input
            size="lg"
            placeholder="First Name"
            onChange={(e) => {
              firstName = e.target.value;
            }}
          />
        </InputGroup>
        <InputGroup flex="1" startElement={<User height="16px" />}>
          <Input
            size="lg"
            placeholder="Last Name"
            onChange={(e) => {
              lastName = e.target.value;
            }}
          />
        </InputGroup>
      </Stack>

      <InputGroup flex="1" width="60%" startElement={<Mail height="16px" />}>
        <Input
          size="lg"
          placeholder="Email"
          onChange={(e) => {
            email = e.target.value;
          }}
        />
      </InputGroup>
      <Stack width="60%">
        <InputGroup flex="1" startElement={<Lock height="16px" />}>
          <PasswordInput
            size="lg"
            placeholder="Password"
            onChange={(e) => {
              password = e.target.value;
            }}
          />
        </InputGroup>
        <PasswordStrengthMeter value={password.length} />
      </Stack>
      <Stack width="60%">
        <InputGroup flex="1" startElement={<Lock height="16px" />}>
          <PasswordInput
            size="lg"
            placeholder="Confirm Password"
            onChange={(e) => {
              confirmPassword = e.target.value;
            }}
          />
        </InputGroup>
        <PasswordStrengthMeter value={confirmPassword.length} />
      </Stack>
      <HStack justify="space-between" width="60%">
        <Checkbox>I agree to the Terms of Service and Privacy Policy</Checkbox>
      </HStack>
      <DialogRoot
        placement="center"
        motionPreset="slide-in-bottom"
        role="alertdialog"
        open={dialogTrigger}
      >
        <DialogTrigger asChild>
          <Button
            width="50%"
            colorPalette="blue"
            onClick={() => {
              handleSignUp();
            }}
          >
            Sign Up
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p>Please check your inputs and try again</p>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline" onClick={() => setDialogTrigger(false)}>
                Close
              </Button>
            </DialogActionTrigger>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
      <Button variant="ghost" onClick={() => setDisplayPage("Login")}>
        Already have an account? Sign in
        <LuExternalLink />
      </Button>
    </Flex>
  );
}

export default SignupPage;
