import { useState } from "react";
import logo from "../assets/logo.png";
import loginBackground from "../assets/loginSplash.png";
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
  DialogRoot,
  DialogTitle,
  DialogTrigger,
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
import { signInUser } from "../firebase";
function LoginPage({ setDisplayPage }) {
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
          src={loginBackground}
        ></Image>
      </Center>

      <Center axis="both" height="100%" width="50%">
        <LoginSection setDisplayPage={setDisplayPage} />
      </Center>
    </Flex>
  );
}

function LoginSection({ setDisplayPage }) {
  const roles = ["Management", "HR Manager", "Employee"];
  const [selectedRole, setSelectedRole] = useState("Employee");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [dialogTrigger, setDialogTrigger] = useState(false);

  async function handleSignIn() {
    const signIn = await signInUser(email, password, selectedRole);
    const status = signIn.status;
    const message = signIn.message;

    if (status == "success") {
      setDisplayPage("EmployeePage");
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
      // outline="1px solid red"
    >
      <Image src={logo}></Image>
      <Text textStyle="2xl" fontWeight="bold">
        Login to your account
      </Text>
      <Text fontWeight="bold">select your role</Text>
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
      <HStack justify="space-between" width="60%">
        <Checkbox>Remember Me</Checkbox>
        <Link href="" colorPalette="blue" fontSize="sm">
          Forgot Password? <LuExternalLink />
        </Link>
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
              handleSignIn();
            }}
          >
            Sign In
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p>Please reenter your email or password</p>
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
      <Button variant="ghost" onClick={() => setDisplayPage("SignUp")}>
        New user? Create your account
        <LuExternalLink />
      </Button>
    </Flex>
  );
}

export default LoginPage;
