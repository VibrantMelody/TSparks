import { useState, useEffect, useCallback, useRef } from "react";
import logo from "../assets/images/logo/tsparks-high-resolution-logo-transparent.png";
import {
  Text,
  Box,
  Container,
  Flex,
  Input,
  Button,
  HStack,
  Stack,
  Separator,
  Heading,
  DialogRoot,
  Image,
  VStack,
  CheckboxCard,
  Grid,
  StackSeparator,
  Alert,
  Badge,
} from "@chakra-ui/react";
import {
  LuUser,
  LuBuilding2,
  LuUsers,
  LuFileText,
  LuMail,
  LuPlus,
  LuSearch,
  LuMessageSquare,
  LuTrash2,
  LuLogOut,
} from "react-icons/lu";
import {
  addDocsToDb,
  getDocsFromDb,
  updateDocInDb,
  deleteDocFromDb,
  updateJobApplication,
  createJobWithApplications,
} from "../firebase";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Award,
  Earth,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Ribbon,
  Send,
  Sparkle,
  SquarePen,
  UserRoundCog,
  Users,
} from "lucide-react";
import { toaster } from "../components/ui/toaster";
import { InputGroup } from "../components/ui/input-group";

function Dialog({ button, title, body, closeButton }) {
  const [open, setOpen] = useState(false);
  return (
    <DialogRoot size="lg" open={open} onOpenChange={(e) => setOpen(e.open)}>
      <DialogTrigger asChild>{button}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody>{body}</DialogBody>
        <DialogFooter>{closeButton}</DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
}

function EmployeePage({ setDisplayPage, user }) {
  const [sidebarSelected, setSidebarSelected] = useState("Dashboard");
  const [activeUser, setActiveUser] = useState({});
  const [users, setUsers] = useState([]);

  const refreshData = useCallback(async () => {
    const fetchedUsers = await getDocsFromDb("Users");
    setUsers(fetchedUsers);

    const activeUser = fetchedUsers.find((fetched) => fetched.id == user);
    setActiveUser(activeUser);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      backgroundColor="gray.950"
      overflow="hidden"
    >
      <Sidebar
        sidebarSelected={sidebarSelected}
        setSidebarSelected={setSidebarSelected}
        setDisplayPage={setDisplayPage}
      />
      <Container
        padding="2rem"
        width="78%"
        height="98%"
        overflow="auto"
        backgroundColor="bg"
        borderRadius="lg"
      >
        {sidebarSelected === "Dashboard" && (
          <Dashboard activeUser={activeUser} users={users} />
        )}
        {sidebarSelected === "Messages" && (
          <Messages
            users={users}
            activeUser={activeUser}
            refreshData={refreshData}
          />
        )}
      </Container>
    </Box>
  );
}

function Sidebar({ sidebarSelected, setSidebarSelected, setDisplayPage }) {
  const buttons = [
    { label: "Dashboard", icon: <LayoutDashboard /> },
    { label: "Messages", icon: <Send /> },
  ];

  return (
    <Container
      width="20%"
      height="100%"
      padding="2rem"
      display="flex"
      flexDirection="column"
      justifyContent="start"
      gap="1rem"
      borderRadius="lg"
    >
      <Image src={logo} width="30%" alignSelf="center" paddingBottom="1rem" />
      {buttons.map((button) => (
        <Button
          key={button.label}
          variant="subtle"
          size="xl"
          onClick={() => setSidebarSelected(button.label)}
          backgroundColor={
            sidebarSelected === button.label ? "yellow.focusRing" : ""
          }
        >
          {button.icon}
          {button.label}
        </Button>
      ))}
      <Button
        variant="subtle"
        colorPalette="red"
        onClick={() => setDisplayPage({ page: "Login", user: "" })}
      >
        <LogOut />
        Logout
      </Button>
    </Container>
  );
}

function Dashboard({ activeUser, users }) {
  const userName =
    activeUser && activeUser.Name ? activeUser.Name.toUpperCase() : "";

  const veteranExcellence = users.filter(
    (user) => user.YearsOfExperience >= 10 && user.Rating === 5
  );
  const technicalWizard = users.filter((user) => user.Skills.length >= 4);
  const certificationChampion = users.filter(
    (user) => user.Certifications.length > 1
  );
  const risingStar = users.filter(
    (user) => user.YearsOfExperience <= 5 && user.Rating >= 4
  );
  const remoteProfessional = users.filter(
    (user) => user.Location === "Remote" && user.Rating >= 4
  );

  return (
    <VStack gap="1rem">
      <Text textStyle="2xl" fontWeight="bold">
        Welcome {userName}
      </Text>
      <Text color="blue.fg">{activeUser.Email}</Text>
      <Text fontWeight="semibold">{activeUser.Location}</Text>
      <Text fontWeight="semibold">
        {activeUser.Department} • {activeUser.JobTitle}
      </Text>
      {veteranExcellence.find((vet) => vet.id === activeUser.id) !==
        undefined && (
        <VStack>
          <Badge colorPalette="green">
            <Ribbon /> Veteran
          </Badge>
        </VStack>
      )}
      {technicalWizard.find((wiz) => wiz.id === activeUser.id) !==
        undefined && (
        <VStack>
          <Badge colorPalette="blue">
            <UserRoundCog /> Technical Wizard
          </Badge>
        </VStack>
      )}
      {certificationChampion.find((cer) => cer.id === activeUser.id) !==
        undefined && (
        <VStack>
          <Badge colorPalette="yellow">
            <Award />
            Certification Champion
          </Badge>
        </VStack>
      )}
      {risingStar.find((str) => str.id === activeUser.id) !== undefined && (
        <VStack>
          <Badge colorPalette="pink">
            <Sparkle />
            Rising Star
          </Badge>
        </VStack>
      )}
      {remoteProfessional.find((rem) => rem.id === activeUser.id) !==
        undefined && (
        <VStack>
          <Badge colorPalette="purple">
            <Earth /> Remote Professional
          </Badge>
        </VStack>
      )}

      <Grid gridTemplateColumns="repeat(3, 1fr)" gridGap="4">
        <Container shadow="lg" padding="4">
          <Text textAlign="center" fontWeight="bold" paddingBottom="4">
            Skills
          </Text>
          <VStack separator={<StackSeparator />}>
            {activeUser.Skills &&
              activeUser["Skills"].map((skill) => <Text>{skill}</Text>)}
          </VStack>
        </Container>

        <Container shadow="lg" padding="4">
          <Text textAlign="center" fontWeight="bold" paddingBottom="4">
            Certifications
          </Text>
          <VStack separator={<StackSeparator />}>
            {activeUser.Certifications &&
              activeUser["Certifications"].map((certification) => (
                <Text>{certification}</Text>
              ))}
          </VStack>
        </Container>

        <Container shadow="lg" padding="4">
          <Text textAlign="center" fontWeight="bold" paddingBottom="4">
            Availability
          </Text>
          <VStack separator={<StackSeparator />}>
            {activeUser.Availability && (
              <Text
                color={
                  activeUser.Availability.Status === "Available"
                    ? "green.fg"
                    : "gray.fg"
                }
              >
                {activeUser.Availability.Status}
              </Text>
            )}
          </VStack>
        </Container>

        <Container shadow="lg" padding="4">
          <Text textAlign="center" fontWeight="bold" paddingBottom="4">
            Assigned Trainings
          </Text>
          <VStack separator={<StackSeparator />}>
            {activeUser.AssignedTrainings &&
              activeUser["AssignedTrainings"].map((training) => (
                <Text>{training}</Text>
              ))}
          </VStack>
        </Container>

        <Container shadow="lg" padding="4">
          <Text textAlign="center" fontWeight="bold" paddingBottom="4">
            Years of Experience
          </Text>
          <Text textAlign="center" fontWeight="bold" paddingBottom="4">
            {activeUser.YearsOfExperience} Years
          </Text>
        </Container>

        <Container shadow="lg" padding="4">
          <Text textAlign="center" fontWeight="bold" paddingBottom="4">
            Received Feedback
          </Text>
          <Text
            textAlign="center"
            fontWeight="bold"
            paddingBottom="4"
            color="red.fg"
          >
            {activeUser.feedback}
          </Text>
        </Container>
      </Grid>
    </VStack>
  );
}

function Messages({ activeUser, users, refreshData }) {
  const [userToMessage, setUserToMessage] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const messageRef = useRef(null);
  const [dialog, setDialog] = useState({
    trigger: false,
    message: "",
  });

  const usersList = users.map((user) => user.Name);

  useEffect(() => {
    getDocsFromDb("Messages").then((messages) => {
      const filteredMessages = messages.filter(
        (message) =>
          message.Sender === activeUser.Name ||
          message.Receiver.includes(activeUser.Name)
      );
      setAllMessages(filteredMessages);
    });
  }, [activeUser]);

  function handleUserCheckChanged(isChecked, user) {
    if (isChecked) {
      setUserToMessage([...userToMessage, user]);
    } else {
      setUserToMessage(userToMessage.filter((u) => u !== user));
    }
  }

  async function handleMessageSend(message) {
    if (!message || userToMessage.length === 0) {
      setDialog({
        trigger: true,
        message: "Please select recipients and enter a message",
      });
      return;
    }

    try {
      const messageRef = await addDocsToDb("Messages", {
        Sender: activeUser.Name,
        Receiver: userToMessage,
        Message: message,
      });

      if (messageRef) {
        setAllMessages((prevMessages) => [
          ...prevMessages,
          {
            Sender: activeUser.Name,
            Receiver: userToMessage,
            Message: message,
          },
        ]);

        setDialog({
          trigger: true,
          message: "Message sent successfully",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setDialog({
        trigger: true,
        message: "Failed to send message",
      });
    }
  }

  return (
    <Container height="100%" width="100%">
      <Dialog
        button={
          <Button>
            <SquarePen />
            Send Message
          </Button>
        }
        title="Send Message"
        body={
          <Stack spacing={4}>
            <Grid templateColumns="repeat(4, 1fr)" gap="1rem">
              {usersList.map((user) => (
                <CheckboxCard.Root
                  key={user}
                  onCheckedChange={(isChecked) =>
                    handleUserCheckChanged(isChecked, user)
                  }
                >
                  <CheckboxCard.HiddenInput />
                  <CheckboxCard.Control>
                    <CheckboxCard.Label>{user}</CheckboxCard.Label>
                  </CheckboxCard.Control>
                </CheckboxCard.Root>
              ))}
            </Grid>

            <InputGroup startElement={<LuFileText />}>
              <Input placeholder="Message" ref={messageRef} />
            </InputGroup>
          </Stack>
        }
        closeButton={
          <DialogRoot
            placement="center"
            motionPreset="slide-in-bottom"
            role="alertdialog"
            open={dialog.trigger}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                onClick={() => {
                  handleMessageSend(messageRef.current.value);
                }}
              >
                Send
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle color="fg.warning">Info</DialogTitle>
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
        }
      />

      <Container width="100%" marginTop="5rem" padding="1rem">
        <Text>Conversations</Text>
        {allMessages.map((message, index) => (
          <Box key={index} p={4} boxShadow="md" borderRadius="lg">
            <Text fontWeight="bold">From: {message.Sender}</Text>
            <Text fontWeight="bold">To: {message.Receiver.join(", ")}</Text>
            <Text>{message.Message}</Text>
          </Box>
        ))}
      </Container>
    </Container>
  );
}

export default EmployeePage;
