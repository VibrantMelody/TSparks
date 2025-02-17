import { useState } from "react";
import logo from "../assets/logo.png";
import signupBackground from "../assets/loginSplash.png";
import {
  Text,
  Box,
  Container,
  Flex,
  Image,
  Center,
  Group,
  Input,
  Link,
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

import { TbLockPassword } from "react-icons/tb";
import { createNewUser } from "../firebase";

function SignupPage({ setDisplayPage }) {
  return (
    <Flex height="100vh" width="100vw">
      <Center
        boxShadow="2xl"
        axis="both"
        height="95%"
        width="48%"
        margin="auto"
        borderRadius="lg"
      >
        <Image
          height="80%"
          width="80%"
          objectFit="cover"
          src={signupBackground}
        ></Image>
      </Center>

      <Center axis="both" height="100%" width="50%">
        <SignupSection setDisplayPage={setDisplayPage} />
      </Center>
    </Flex>
  );
}

function SignupSection({ setDisplayPage }) {
  const roles = ["Management", "HR Manager", "Employee"];
  const [selectedRole, setSelectedRole] = useState("Employee");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [dialogTrigger, setDialogTrigger] = useState(false);

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

  function handleRoleChange(role) {
    setSelectedRole(role);
  }

  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      gap="1.5rem"
      width="60%"
    >
      <Image src={logo}></Image>
      <Text textStyle="2xl" fontWeight="bold">
        Create your account
      </Text>
      <Text fontWeight="bold">Select your role</Text>
      <SegmentedControl
        size="md"
        defaultValue={selectedRole}
        value={selectedRole}
        onValueChange={(e) => handleRoleChange(e.value)}
        items={["HR Manager", "Management", "Employee", "Upper Management"]}
      />
      <Separator width="80%" />
      <InputGroup flex="1" width="60%" startElement={<LuUser />}>
        <Input
          placeholder="Email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
      </InputGroup>
      <Stack width="60%">
        <InputGroup flex="1" startElement={<TbLockPassword />}>
          <PasswordInput
            placeholder="Password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </InputGroup>
        <PasswordStrengthMeter value={password.length} />
      </Stack>
      <Stack width="60%">
        <InputGroup flex="1" startElement={<TbLockPassword />}>
          <PasswordInput
            placeholder="Confirm Password"
            onChange={(e) => {
              setConfirmPassword(e.target.value);
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
