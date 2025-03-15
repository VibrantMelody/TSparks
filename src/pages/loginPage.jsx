import { useState } from "react";
import logo from "../assets/images/logo/tsparks-high-resolution-logo-transparent-black-text.png";
import loginBackground from "../assets/images/wai-siew-HFau1CX6vsw-unsplash.jpg";
import {
  Text,
  Box,
  Container,
  Flex,
  Image,
  Center,
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
    <Flex height="100vh" width="100vw" position="relative">
      <Box
        width="49%"
        height="98%"
        margin="auto"
        padding="0"
        borderRadius="15px"
        shadow="2xl"
        bgImage={`linear-gradient(to top, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0)), url(${loginBackground})`}
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
          "The right talent in the right place can transform industries and
          change lives. At TSPARK, we don't just manage talent—we cultivate it,
          empower it, and help it thrive in an ever-evolving world."
        </Text>
      </Box>

      <Center axis="both" height="100%" width="50%">
        <LoginSection setDisplayPage={setDisplayPage} />
      </Center>
    </Flex>
  );
}

function LoginSection({ setDisplayPage }) {
  const [selectedRole, setSelectedRole] = useState("Employee");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [dialogTrigger, setDialogTrigger] = useState(false);

  async function handleSignIn() {
    const signIn = await signInUser(email, password, selectedRole);
    const status = signIn.status;
    const message = signIn.message;

    if (status == "success") {
      setDisplayPage(selectedRole);
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
      <Image src={logo} height="20%" width="20%"></Image>
      <Text textStyle="2xl" fontWeight="bold">
        Login to your account
      </Text>
      <Text fontWeight="bold">select your role</Text>
      <SegmentedControl
        size="lg"
        defaultValue={selectedRole}
        value={selectedRole}
        onValueChange={(e) => handleRoleChange(e.value)}
        items={["HR Manager", "Management", "Employee", "Upper Management"]}
      />
      <Separator width="80%" />
      <InputGroup flex="1" width="60%" startElement={<LuUser />}>
        <Input
          size="lg"
          placeholder="Email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
      </InputGroup>
      <Stack width="60%">
        <InputGroup flex="1" startElement={<TbLockPassword />}>
          <PasswordInput
            size="lg"
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
