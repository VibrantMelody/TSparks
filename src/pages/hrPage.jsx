import { useState, useEffect, useCallback, useRef } from "react";
import WorkforceAnalytics from "./dataPage";
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
  ChartBar,
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

function HRPage({ setDisplayPage, user }) {
  const [sidebarSelected, setSidebarSelected] = useState("Dashboard");

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const refreshData = useCallback(async () => {
    const jobListings = await getDocsFromDb("JobListings");
    setJobs(jobListings);

    const jobApplications = await getDocsFromDb("JobApplications");
    setApplications(jobApplications);

    const userList = await getDocsFromDb("Users");
    setUsers(userList);
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
          <Dashboard
            user={user}
            jobs={jobs}
            users={users}
            refreshData={refreshData}
          />
        )}
        {sidebarSelected === "Job Listings" && (
          <JobListings
            jobs={jobs}
            applications={applications}
            users={users}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            refreshData={refreshData}
          />
        )}
        {sidebarSelected === "Promotions" && (
          <Employees
            users={users}
            applications={applications}
            jobs={jobs}
            refreshData={refreshData}
          />
        )}

        {sidebarSelected === "HR Analytics Data" && (
          <WorkforceAnalytics data={users} />
        )}
        {sidebarSelected === "Messages" && (
          <Messages user={user} users={users} />
        )}
      </Container>
    </Box>
  );
}

function Sidebar({ sidebarSelected, setSidebarSelected, setDisplayPage }) {
  const buttons = [
    { label: "Dashboard", icon: <LayoutDashboard /> },
    { label: "Job Listings", icon: <ListTodo /> },
    { label: "Promotions", icon: <Users /> },
    { label: "HR Analytics Data", icon: <ChartBar /> },
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

function Dashboard({ user, jobs, users, refreshData }) {
  return (
    <VStack gap="2rem">
      <Text textStyle="2xl" fontWeight="bold">
        Welcome {user.toUpperCase()}
      </Text>
      <JobDialog refreshData={refreshData} />
      <JobStats jobs={jobs} users={users} refreshData={refreshData} />
    </VStack>
  );
}

function JobListings({
  jobs,
  applications,
  users,
  searchTerm,
  setSearchTerm,
  refreshData,
}) {
  return (
    <Stack spacing={6} width="100%">
      <JobSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <Separator />
      <Listings
        jobs={jobs}
        applications={applications}
        users={users}
        searchTerm={searchTerm}
        refreshData={refreshData}
      />
    </Stack>
  );
}

function Employees({ users, applications, jobs, refreshData }) {
  function findAppliedJob(applicationID) {
    const application = applications.find((app) => app.id === applicationID);
    if (!application) return "Unknown Job";

    const job = jobs.find((job) => job.id === application.JobID);
    return job ? job.Title : "Unknown Job";
  }

  async function handlePromotion(user) {
    try {
      await updateDocInDb("Users", user.id, {
        isPromoted: true,
      });

      await refreshData();
      console.log("Promotion successful");
      toaster.create({
        description: "Promotion successful",
        type: "info",
      });
    } catch (error) {
      console.error(error);
      toaster.create({
        description: "Promotion unsuccessful",
        type: "error",
      });
    }
  }

  return (
    <Grid gridTemplateColumns="repeat(3, 1fr)" gridGap="4" width="100%">
      {users
        .filter((user) => user.CurrentJobApplications.length > 0)
        .map((user) => (
          <VStack key={user.id} boxShadow="md" padding={4} borderRadius="10px">
            <VStack gap="0">
              <Text fontWeight="bold">{user.Name}</Text>
              <Text color="gray.600" fontSize="sm">
                {user.Email}
              </Text>
              <Text
                color="gray.600"
                fontSize="sm"
                fontWeight="semibold"
                paddingBottom="2"
              >
                {user.JobTitle} • {user.Location}
              </Text>
              <Text color="fg.info" fontSize="sm" fontWeight="semibold">
                Applied at: {findAppliedJob(user.CurrentJobApplications[0])}
              </Text>
            </VStack>

            <Container bg="bg.subtle" padding="2" borderRadius="10px">
              <Text
                fontSize="sm"
                textAlign="center"
                fontWeight="semibold"
                paddingBottom="2"
              >
                Skills
              </Text>
              <VStack gap="2" separator={<StackSeparator />}>
                {user.Skills.map((skill) => (
                  <Text fontSize="sm">{skill}</Text>
                ))}
              </VStack>
            </Container>

            {user.Rating > 4 ? (
              <HStack marginTop="auto">
                <Alert.Root status="info">
                  <Alert.Indicator />
                  <Alert.Title>Recommended for promotion</Alert.Title>
                </Alert.Root>
                {!Object.keys(user).includes("isPromoted") ? (
                  <Button onClick={() => handlePromotion(user)}>Promote</Button>
                ) : (
                  <Button disabled>Promoted</Button>
                )}
              </HStack>
            ) : (
              <Alert.Root status="error" marginTop="auto">
                <Alert.Indicator />
                <Alert.Title>Do not qualify for promotion</Alert.Title>
              </Alert.Root>
            )}
          </VStack>
        ))}
    </Grid>
  );
}

function Messages({ users, user }) {
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
        (message) => message.Sender === user || message.Receiver.includes(user)
      );
      setAllMessages(filteredMessages);
    });
  }, [user]);

  function handleUserCheckChanged(isChecked, user) {
    if (isChecked) {
      setUserToMessage([...userToMessage, user]);
    } else {
      setUserToMessage(userToMessage.filter((u) => u !== user));
    }
  }

  async function handleMessageSend(message) {
    try {
      const messageRef = await addDocsToDb("Messages", {
        Sender: user,
        Receiver: userToMessage,
        Message: message,
      });

      if (messageRef) {
        setAllMessages((prevMessages) => [
          ...prevMessages,
          { Sender: user, Receiver: userToMessage, Message: message },
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

function JobDialog({ refreshData }) {
  const [dialogTrigger, setDialogTrigger] = useState(false);

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState([]);

  const handleCreateJob = async () => {
    await createJobWithApplications({
      Title: title,
      Department: department,
      Location: location,
      Description: description,
      Requirements: requirements,
      Status: "Active",
    });

    await refreshData();
    setDialogTrigger(false);
  };

  return (
    <DialogRoot
      open={dialogTrigger}
      onOpenChange={(e) => setDialogTrigger(e.open)}
    >
      <DialogTrigger asChild>
        <Button leftIcon={<LuPlus />}>Post New Job</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Job Posting</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Stack spacing={4}>
            <InputGroup startElement={<LuUser />}>
              <Input
                placeholder="Job Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </InputGroup>
            <InputGroup startElement={<LuBuilding2 />}>
              <Input
                placeholder="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </InputGroup>
            <InputGroup startElement={<LuBuilding2 />}>
              <Input
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </InputGroup>
            <InputGroup startElement={<LuFileText />}>
              <Input
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </InputGroup>
            <InputGroup startElement={<LuFileText />}>
              <Input
                placeholder="Requirements (comma separated)"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value.split(","))}
              />
            </InputGroup>
          </Stack>
        </DialogBody>
        <DialogFooter>
          <Button onClick={handleCreateJob}>Create Job Posting</Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
}

function JobStats({ jobs, users, refreshData }) {
  const [employeeDialogTrigger, setEmployeeDialogTrigger] = useState(false);

  return (
    <Flex gap={4}>
      <Box p={4} boxShadow="md" borderRadius="lg" flex={1}>
        <Flex align="center" gap={2}>
          <LuFileText />
          <Text fontWeight="bold">Active Jobs</Text>
        </Flex>
        <Text fontSize="2xl" fontWeight="bold" mt={2}>
          {jobs.length}
        </Text>
      </Box>

      <Box p={4} boxShadow="md" borderRadius="lg" flex={1}>
        <Flex align="center" gap={2}>
          <LuUsers />
          <Text fontWeight="bold">Total Applicants</Text>
        </Flex>
        <Text fontSize="2xl" fontWeight="bold" mt={2}>
          {jobs.reduce((sum, job) => sum + job.Applications.length, 0)}
        </Text>
      </Box>

      <Box p={4} boxShadow="md" borderRadius="lg" flex={1}>
        <Flex align="center" gap={2}>
          <LuBuilding2 />
          <Text fontWeight="bold">Departments</Text>
        </Flex>
        <Text fontSize="2xl" fontWeight="bold" mt={2}>
          {new Set(jobs.map((job) => job.Department)).size}
        </Text>
      </Box>

      <Box p={4} boxShadow="md" borderRadius="lg" flex={1}>
        <Flex align="center" gap={2}>
          <LuUser />
          <Text fontWeight="bold">Employees</Text>
        </Flex>
        <Text fontSize="2xl" fontWeight="bold" mt={2}>
          {users.length}
        </Text>
        <Button
          variant="outline"
          mt={4}
          onClick={() => setEmployeeDialogTrigger(true)}
        >
          View Employees
        </Button>
      </Box>

      <EmployeeDialog
        users={users}
        dialogTrigger={employeeDialogTrigger}
        setDialogTrigger={setEmployeeDialogTrigger}
        refreshData={refreshData}
      />
    </Flex>
  );
}

function EmployeeDialog({
  users,
  dialogTrigger,
  setDialogTrigger,
  refreshData,
}) {
  const [feedbackDialogTrigger, setFeedbackDialogTrigger] = useState(false);
  const [infoDialogTrigger, setInfoDialogTrigger] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleGiveFeedback = (user) => {
    setSelectedUser(user);
    setFeedbackDialogTrigger(true);
  };

  const handleViewInfo = (user) => {
    setSelectedUser(user);
    setInfoDialogTrigger(true);
  };

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
    <DialogRoot
      open={dialogTrigger}
      onOpenChange={(e) => setDialogTrigger(e.open)}
      size="lg"
      scrollBehavior="inside"
      motionPreset="slide-in-top"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Employees</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Stack spacing={4} separator={<StackSeparator />}>
            {users.map((user, index) => (
              <Flex key={index} justify="space-between" align="center">
                <VStack align="start">
                  <Text fontWeight="semibold">{user.Name}</Text>
                  <Text color="blue.fg">{user.Email}</Text>
                  <HStack>
                    {veteranExcellence.find((vet) => vet.id === user.id) !==
                      undefined && (
                      <Badge colorPalette="green">
                        <Ribbon /> Veteran
                      </Badge>
                    )}
                    {technicalWizard.find((wiz) => wiz.id === user.id) !==
                      undefined && (
                      <Badge colorPalette="blue">
                        <UserRoundCog /> Technical Wizard
                      </Badge>
                    )}
                    {certificationChampion.find((cer) => cer.id === user.id) !==
                      undefined && (
                      <Badge colorPalette="yellow">
                        <Award />
                        Certification Champion
                      </Badge>
                    )}
                    {risingStar.find((str) => str.id === user.id) !==
                      undefined && (
                      <Badge colorPalette="pink">
                        <Sparkle />
                        Rising Star
                      </Badge>
                    )}
                    {remoteProfessional.find((rem) => rem.id === user.id) !==
                      undefined && (
                      <Badge colorPalette="purple">
                        <Earth /> Remote Professional
                      </Badge>
                    )}
                  </HStack>
                </VStack>
                <HStack spacing={2}>
                  <Button
                    variant="outline"
                    leftIcon={<LuMessageSquare />}
                    onClick={() => handleGiveFeedback(user)}
                  >
                    Give Feedback
                  </Button>
                  <Button
                    variant="outline"
                    leftIcon={<LuUser />}
                    onClick={() => handleViewInfo(user)}
                  >
                    View Info
                  </Button>
                </HStack>
              </Flex>
            ))}
          </Stack>
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

      <FeedbackDialog
        user={selectedUser}
        dialogTrigger={feedbackDialogTrigger}
        setDialogTrigger={setFeedbackDialogTrigger}
        refreshData={refreshData}
      />

      <InfoDialog
        user={selectedUser}
        dialogTrigger={infoDialogTrigger}
        setDialogTrigger={setInfoDialogTrigger}
      />
    </DialogRoot>
  );
}

function FeedbackDialog({
  user,
  dialogTrigger,
  setDialogTrigger,
  refreshData,
}) {
  const [description, setDescription] = useState("");

  const handleCreateFeedback = async () => {
    await updateDocInDb("Users", user.id, {
      Feedback: description,
    });

    await refreshData();
    setDialogTrigger(false);
  };

  return (
    <DialogRoot
      open={dialogTrigger}
      onOpenChange={(e) => setDialogTrigger(e.open)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Give Feedback to {user?.Name}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Stack spacing={4}>
            <InputGroup startElement={<LuMessageSquare />}>
              <Input
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </InputGroup>
          </Stack>
        </DialogBody>
        <DialogFooter>
          <Button onClick={handleCreateFeedback}>Create Feedback</Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
}

function InfoDialog({ user, dialogTrigger, setDialogTrigger }) {
  return (
    <DialogRoot
      open={dialogTrigger}
      onOpenChange={(e) => setDialogTrigger(e.open)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Employee Info</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Stack spacing={4}>
            <Text>Name: {user?.Name}</Text>
            <Text>Email: {user?.Email}</Text>
            <Text>Position: {user?.Position}</Text>
            <Text>Feedback: {user?.Feedback}</Text>
            <Text>Certifications: {user?.Certifications.join(", ")}</Text>
            <Text>Roles: {user?.Role}</Text>
            <Text>Years of Experience: {user?.YearsOfExperience}</Text>
            <Text>Availability: {user?.Availability.Status}</Text>
          </Stack>
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
  );
}

function JobSearch({ searchTerm, setSearchTerm }) {
  return (
    <InputGroup startElement={<LuSearch />}>
      <Input
        placeholder="Search jobs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </InputGroup>
  );
}

function Listings({ jobs, applications, users, searchTerm, refreshData }) {
  const handleDeleteJob = async (jobId) => {
    await deleteDocFromDb("JobListings", jobId);
    await refreshData();
  };

  return (
    <Stack spacing={4}>
      {jobs
        .filter(
          (job) =>
            job.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.Department.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((job) => (
          <Box key={job.id} p={4} boxShadow="md" borderRadius="lg">
            <Flex justify="space-between" align="start">
              <Box>
                <Text fontWeight="bold">{job.Title}</Text>
                <Text color="gray.600">
                  {job.Department} • {job.Location}
                </Text>
              </Box>
              <Text color={job.Status === "Active" ? "green.500" : "gray.500"}>
                {job.Status}
              </Text>
            </Flex>
            <Text mt={4}>{job.Description}</Text>
            <HStack mt={4} spacing={4}>
              <ApplicantDialog
                job={job}
                applications={applications}
                users={users}
                refreshData={refreshData}
              />
              <Button
                variant="outline"
                leftIcon={<LuMail />}
                onClick={() => handleEmailCandidates(job, users, applications)}
              >
                Email Candidates
              </Button>
              <Button
                variant="outline"
                colorPalette="red"
                leftIcon={<LuTrash2 />}
                onClick={() => handleDeleteJob(job.id)}
              >
                Delete Job
              </Button>
            </HStack>
          </Box>
        ))}
    </Stack>
  );
}

function handleEmailCandidates(job, users, applications) {
  const usersList = [];
  const jobApplications = job.Applications;
  jobApplications.forEach((applicationId) => {
    applications.forEach((app) => {
      if (app.id === applicationId) {
        users.forEach((user) => {
          if (user.id === app.UserID) {
            usersList.push(user);
          }
        });
      }
    });
  });

  const emailAddresses = usersList.map((user) => user.Email).join(",");
  const mailtoLink = `mailto:${emailAddresses}`;
  window.location.href = mailtoLink;
}

function ApplicantDialog({ job, applications, users, refreshData }) {
  const usersList = [];
  const jobApplications = job.Applications;
  jobApplications.forEach((applicationId) => {
    applications.forEach((app) => {
      if (app.id === applicationId) {
        users.forEach((user) => {
          if (user.id === app.UserID) {
            usersList.push({ ...user, applicationId: app.id });
          }
        });
      }
    });
  });

  const handleApplicationStatus = async (applicationId, status) => {
    await updateJobApplication(job.id, applicationId, status);
    await refreshData();
  };

  return (
    <DialogRoot
      placement="center"
      size="cover"
      scrollBehavior="inside"
      motionPreset="slide-in-top"
    >
      <DialogTrigger asChild>
        <Button variant="outline" leftIcon={<LuUsers />}>
          {job.Applications.length} Applications
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Applicants</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Stack spacing={4} width="full">
            {usersList.map((user) => (
              <Flex
                direction="column"
                gap="2"
                boxShadow="lg"
                p="4"
                key={user.id}
              >
                <Heading>{user.Name}</Heading>
                <Text color="blue.fg">{user.Email}</Text>
                <Text fontWeight="bold">{user.Certifications}</Text>
                <HStack spacing="4">
                  <Button
                    alignSelf="end"
                    onClick={() =>
                      handleApplicationStatus(user.applicationId, "Accepted")
                    }
                  >
                    Accept
                  </Button>
                  <Button
                    colorPalette="red"
                    alignSelf="end"
                    onClick={() =>
                      handleApplicationStatus(user.applicationId, "Rejected")
                    }
                  >
                    Reject
                  </Button>
                </HStack>
              </Flex>
            ))}
          </Stack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button colorPalette="red">Close</Button>
          </DialogActionTrigger>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
}

export default HRPage;
