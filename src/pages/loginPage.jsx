import { useEffect, useRef, useState } from "react";
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
  Grid,
  CheckboxCard,
  RadioCard,
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
import { getDocsFromDb, signInUser } from "../firebase";
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
  const [userCredential, setuserCredential] = useState({
    email: "",
    password: "",
  });
  const [userSelectionDialog, setUserSelectionDialog] = useState(false);
  const [dialog, setDialog] = useState({ trigger: false, message: "" });
  const [users, setUsers] = useState([]);
  const [choosenUser, setChoosenUser] = useState({});

  useEffect(() => {
    getDocsFromDb("Users").then((users) => {
      setUsers(users);
    });
  }, []);

  async function handleSignIn() {
    const signIn = await signInUser(
      userCredential.email,
      userCredential.password,
      selectedRole,
      setDialog
    );

    if (signIn.returnID === true) {
      if (selectedRole === "Employee") {
        setUserSelectionDialog(true);
      } else {
        setDisplayPage({ page: selectedRole, user: signIn.user });
      }
    }
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
        onValueChange={(e) => setSelectedRole(e.value)}
        items={["HR Manager", "Management", "Employee"]}
      />
      <Separator width="80%" />
      <InputGroup flex="1" width="60%" startElement={<LuUser />}>
        <Input
          size="lg"
          placeholder="Email"
          onChange={(e) => {
            setuserCredential({ ...userCredential, email: e.target.value });
          }}
        />
      </InputGroup>
      <Stack width="60%">
        <InputGroup flex="1" startElement={<TbLockPassword />}>
          <PasswordInput
            size="lg"
            placeholder="Password"
            onChange={(e) => {
              setuserCredential({
                ...userCredential,
                password: e.target.value,
              });
            }}
          />
        </InputGroup>
        <PasswordStrengthMeter value={userCredential.password.length} />
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
        open={dialog.trigger}
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
            <DialogTitle color="fg.error">Error</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p>{dialog.message}</p>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button
                variant="outline"
                onClick={() => setDialog({ trigger: false, message: "" })}
              >
                Close
              </Button>
            </DialogActionTrigger>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
      <Button
        variant="ghost"
        onClick={() => setDisplayPage({ page: "SignUp", name: "" })}
      >
        New user? Create your account
        <LuExternalLink />
      </Button>

      <DialogRoot
        placement="center"
        motionPreset="slide-in-top"
        open={userSelectionDialog}
        onOpenChange={(e) => setUserSelectionDialog(e.open)}
        size="lg"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle textAlign="center">
              Please choose user to log in as
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <RadioCard.Root
              defaultValue=""
              onValueChange={(e) => setChoosenUser(e.value)}
            >
              <Grid gridTemplateColumns="repeat(3, 1fr)" gridGap="4">
                {users.map((user) => (
                  <RadioCard.Item key={user.id} value={user.id}>
                    <RadioCard.ItemHiddenInput />
                    <RadioCard.ItemControl>
                      <RadioCard.ItemText>{user.Name}</RadioCard.ItemText>
                    </RadioCard.ItemControl>
                  </RadioCard.Item>
                ))}
              </Grid>
            </RadioCard.Root>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button
                onClick={() =>
                  setDisplayPage({ page: selectedRole, user: choosenUser })
                }
              >
                Next
              </Button>
            </DialogActionTrigger>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </Flex>
  );
}

export default LoginPage;
