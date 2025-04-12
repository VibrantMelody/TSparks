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
  Float,
  Icon,
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
  BookOpen,
  Building2,
  Clock,
  Contact,
  Delete,
  Earth,
  LaptopMinimalCheck,
  LayoutDashboard,
  ListPlus,
  ListTodo,
  LogOut,
  Mail,
  MapPin,
  Ribbon,
  Save,
  Send,
  ShieldCheck,
  Sparkle,
  SquarePen,
  SquareUser,
  Trash2,
  UserPen,
  UserRoundCog,
  Users,
} from "lucide-react";
import { toaster } from "../components/ui/toaster";
import { InputGroup } from "../components/ui/input-group";
import Learnings from "../comps/learnings";
import { TbWashDryP } from "react-icons/tb";

function Dialog({ button, title, body, closeButton }) {
  const [open, setOpen] = useState(false);
  return (
    <DialogRoot
      size="lg"
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      placement="center"
    >
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
  const [jobs, setJobs] = useState([]);

  const refreshData = useCallback(async () => {
    const fetchedUsers = await getDocsFromDb("Users");
    setUsers(fetchedUsers);

    const jobListings = await getDocsFromDb("JobListings");
    setJobs(jobListings);

    const activeUser = fetchedUsers.find((fetched) => fetched.id == user);
    setActiveUser(activeUser);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  if (!activeUser || !users || !jobs) {
    return <Text>Loading...</Text>;
  }

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

        {sidebarSelected === "Available Jobs" && (
          <AvailableJobs
            activeUser={activeUser}
            users={users}
            jobs={jobs}
            refreshData={refreshData}
          />
        )}

        {sidebarSelected === "Learnings" && (
          <Learnings activeUserID={activeUser.id} />
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
    { label: "Available Jobs", icon: <ListPlus /> },
    { label: "Learnings", icon: <BookOpen /> },
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
  const [userDetails, setUserDetails] = useState({
    fullName: "",
    email: "",
    location: "",
    jobTitle: "",
    department: "",
    skills: "",
    certifications: "",
    availability: "",
  });
  const [trainings, setTrainings] = useState(undefined);
  const refreshData = useCallback(async () => {
    await getDocsFromDb("Learnings").then((trainings) => {
      setTrainings(trainings);
    });
  }, []);

  useEffect(() => {
    refreshData();
  }, []);

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

  if (!trainings) {
    return <Text>Loading...</Text>;
  }

  return (
    <VStack gap="1rem" position="relative">
      <Dialog
        button={
          <Float oat placement="top-start" offsetX="12">
            <Button variant="ghost">
              <UserPen /> Edit Details
            </Button>
          </Float>
        }
        title="Edit Details"
        body={
          <VStack>
            <InputGroup
              startElement={
                <Icon size="md">
                  <Contact />
                </Icon>
              }
            >
              <Input
                placeholder="Full Name"
                value={userDetails.fullName}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, fullName: e.target.value })
                }
              />
            </InputGroup>
            <InputGroup
              startElement={
                <Icon size="md">
                  <Mail />
                </Icon>
              }
            >
              <Input
                placeholder="Email"
                value={userDetails.email}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, email: e.target.value })
                }
              />
            </InputGroup>
            <InputGroup
              startElement={
                <Icon size="md">
                  <MapPin />
                </Icon>
              }
            >
              <Input
                placeholder="Location"
                value={userDetails.location}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, location: e.target.value })
                }
              />
            </InputGroup>
            <InputGroup
              startElement={
                <Icon size="md">
                  <SquareUser />
                </Icon>
              }
            >
              <Input
                placeholder="Job Title"
                value={userDetails.jobTitle}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, jobTitle: e.target.value })
                }
              />
            </InputGroup>
            <InputGroup
              startElement={
                <Icon size="md">
                  <Building2 />
                </Icon>
              }
            >
              <Input
                placeholder="Department"
                value={userDetails.department}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, department: e.target.value })
                }
              />
            </InputGroup>
            <InputGroup
              startElement={
                <Icon size="md">
                  <LaptopMinimalCheck />
                </Icon>
              }
            >
              <Input
                placeholder="Skills - Comma Seperated"
                value={userDetails.skills}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, skills: e.target.value })
                }
              />
            </InputGroup>
            <InputGroup
              startElement={
                <Icon size="md">
                  <ShieldCheck />
                </Icon>
              }
            >
              <Input
                placeholder="Certifications - Comma Seperated"
                value={userDetails.certifications}
                onChange={(e) =>
                  setUserDetails({
                    ...userDetails,
                    certifications: e.target.value,
                  })
                }
              />
            </InputGroup>
            <InputGroup
              startElement={
                <Icon size="md">
                  <Clock />
                </Icon>
              }
            >
              <Input
                placeholder="Availability"
                value={userDetails.availability}
                onChange={(e) =>
                  setUserDetails({
                    ...userDetails,
                    availability: e.target.value,
                  })
                }
              />
            </InputGroup>
          </VStack>
        }
        closeButton={
          <Button>
            <Save /> Submit
          </Button>
        }
      />

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
            {Object.hasOwn(activeUser, "AssignedLearnings") &&
              Object.entries(activeUser.AssignedLearnings).map(
                ([trainingID, [assignedBy, status]]) => {
                  const training = trainings.find(
                    (training) => training.id === trainingID
                  );
                  return <Text key={training.id}>{training.title}</Text>;
                }
              )}
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
            {activeUser.Feedback}
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

  async function handleMessageDelete(message) {
    try {
      await deleteDocFromDb("Messages", message.id);
      toaster.create({
        description: "Message Deleted Successfully",
        type: "success",
      });
      refreshData();
    } catch (err) {
      toaster.create({
        description: "Couldn't delete message",
        type: "error",
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
          <HStack
            key={index}
            p={4}
            boxShadow="md"
            borderRadius="lg"
            justifyContent="space-between"
          >
            <VStack align="start">
              <Text fontWeight="bold">From: {message.Sender}</Text>
              <Text fontWeight="bold">To: {message.Receiver.join(", ")}</Text>
              <Text>{message.Message}</Text>
            </VStack>
            <Button
              colorPalette="red"
              onClick={() => handleMessageDelete(message)}
            >
              <Trash2 />
            </Button>
          </HStack>
        ))}
      </Container>
    </Container>
  );
}

function AvailableJobs({ activeUser, users, jobs, refreshData }) {
  let appliedJobs, availabeJobs;
  if (Object.hasOwn(activeUser, "CurrentJobApplications")) {
    appliedJobs = jobs.filter((job) =>
      Object.keys(activeUser.CurrentJobApplications).includes(job.id)
    );
    availabeJobs = jobs.filter(
      (job) => !Object.keys(activeUser.CurrentJobApplications).includes(job.id)
    );
  } else {
    appliedJobs = [];
    availabeJobs = jobs;
  }

  async function handleApplicationChange(jobID) {
    try {
      await updateDocInDb("Users", activeUser.id, {
        CurrentJobApplications: {
          ...activeUser.CurrentJobApplications,
          [jobID]: jobID,
        },
      });
      toaster.create({
        description: "Applied for job successfully",
        type: "success",
      });
    } catch {
      toaster.create({
        description: "Couldn't apply for job",
        type: "error",
      });
    } finally {
      await refreshData();
    }
  }

  return (
    <VStack>
      <VStack gap="5">
        <Text fontWeight="bold" fontSize="2xl">
          Applied Jobs
        </Text>
        <Grid gridTemplateColumns={"repeat(3, 1fr)"} gridGap="4">
          {appliedJobs.map((job, index) => (
            <VStack
              key={index}
              p={4}
              boxShadow="md"
              borderRadius="lg"
              justifyContent="space-between"
              separator={<StackSeparator />}
            >
              <Text fontWeight="bold">{job.Title}</Text>
              <Text textAlign="center">{job.Description}</Text>
              <Text>
                {job.Location} • {job.Department}
              </Text>
              {
                job.Requirements && (
                  <Text>Requirements: {job.Requirements.join(",")}</Text>
                )
                // job.Requirements.map((requirement, index) => (
                //   <Text key={index}>{requirement}</Text>
                // ))
              }
              <Text color="fg.info">Start Date: {job.StartDate}</Text>
              <Text color="fg.error">End Date: {job.EndDate}</Text>
              <Badge padding="0 2rem" colorPalette="green">
                Applied
              </Badge>
            </VStack>
          ))}
        </Grid>
      </VStack>
      <VStack gap="5">
        <Text fontWeight="bold" fontSize="2xl">
          Available Jobs
        </Text>
        <Grid gridTemplateColumns={"repeat(3, 1fr)"} gridGap="4">
          {availabeJobs.map((job, index) => (
            <VStack
              key={index}
              p={4}
              boxShadow="md"
              borderRadius="lg"
              justifyContent="space-between"
              separator={<StackSeparator />}
            >
              <Text fontWeight="bold">{job.Title}</Text>
              <Text textAlign="center">{job.Description}</Text>
              <Text>
                {job.Location} • {job.Department}
              </Text>
              {
                job.Requirements && (
                  <Text>Requirements: {job.Requirements.join(",")}</Text>
                )
                // job.Requirements.map((requirement, index) => (
                //   <Text key={index}>{requirement}</Text>
                // ))
              }
              <Text color="fg.info">Start Date: {job.StartDate}</Text>
              <Text color="fg.error">End Date: {job.EndDate}</Text>
              <Button
                padding="0 2rem"
                onClick={() => handleApplicationChange(job.id)}
              >
                Apply
              </Button>
            </VStack>
          ))}
        </Grid>
      </VStack>
    </VStack>
  );
}
export default EmployeePage;
