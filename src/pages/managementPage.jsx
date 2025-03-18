import { useState, useEffect, useCallback } from "react";
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
  Link,
  DialogRoot,
  Image,
  VStack,
  StackSeparator,
  Badge,
} from "@chakra-ui/react";
import {
  LuUser,
  LuBookOpen,
  LuBriefcase,
  LuTrendingUp,
  LuPlus,
  LuSearch,
  LuLogOut,
} from "react-icons/lu";
import { addDocsToDb, getDocsFromDb, updateDocInDb } from "../firebase";
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
import { InputGroup } from "../components/ui/input-group";
import {
  BookPlus,
  LayoutDashboard,
  ListTodo,
  LogOut,
  UserRoundMinus,
  UserRoundPlus,
  UserRoundPlusIcon,
  Users,
} from "lucide-react";
import { toaster } from "../components/ui/toaster";

function ManagementPage({ setDisplayPage }) {
  const [sidebarSelected, setSidebarSelected] = useState("Dashboard");
  const [users, setUsers] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [skills, setSkills] = useState([]);
  const [careers, setCareers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const refreshData = useCallback(async () => {
    getDocsFromDb("Users").then((users) => {
      setUsers(users);
    });

    getDocsFromDb("Trainings").then((trainingPrograms) => {
      setTrainings(trainingPrograms);
    });

    getDocsFromDb("Skills").then((skillResources) => {
      setSkills(skillResources);
    });

    getDocsFromDb("Careers").then((careerTools) => {
      setCareers(careerTools);
    });
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
          <Dashboard trainings={trainings} refreshData={refreshData} />
        )}
        {sidebarSelected === "Course Listings" && (
          <CourseListings
            trainings={trainings}
            skills={skills}
            careers={careers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}
        {sidebarSelected === "Employees" && (
          <Employee
            users={users}
            trainings={trainings}
            skills={skills}
            careers={careers}
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
    { label: "Course Listings", icon: <ListTodo /> },
    { label: "Employees", icon: <Users /> },
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

function Dashboard({ trainings, refreshData }) {
  return (
    <Container maxW="full" width="100%" overflow="auto" padding="2rem">
      <Stack spacing={6} width="100%">
        <Flex justify="space-between" align="center">
          <Text textStyle="2xl" fontWeight="bold">
            Management Dashboard
          </Text>
          <TrainingDialog refreshData={refreshData} />
        </Flex>
        <TrainingStats trainings={trainings} />
      </Stack>
    </Container>
  );
}

function CourseListings({
  trainings,
  skills,
  careers,
  searchTerm,
  setSearchTerm,
}) {
  return (
    <Stack spacing={6} width="100%">
      <TrainingSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <Separator />
      <TrainingListings
        trainings={trainings}
        skills={skills}
        careers={careers}
        searchTerm={searchTerm}
      />
    </Stack>
  );
}

function Employee({ users, trainings, careers, refreshData }) {
  async function handleTrainingAssignment(user, training) {
    try {
      if (Object.keys(user).includes("AssignedTrainings")) {
        await updateDocInDb("Users", user.id, {
          AssignedTrainings: [...user.AssignedTrainings, training.Title],
        });
      } else {
        await updateDocInDb("Users", user.id, {
          AssignedTrainings: [training.Title],
        });
      }

      await refreshData();

      toaster.create({
        description: "Training assigned successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error assigning training: ", error);
      toaster.create({
        description: "Error assigning training",
        type: "error",
      });
    }
  }

  async function handleRemoveTraining(user, training) {
    const newTrainings = user.AssignedTrainings.filter(
      (assigned) => assigned !== training
    );
    try {
      await updateDocInDb("Users", user.id, {
        AssignedTrainings: newTrainings,
      });
      await refreshData();

      toaster.create({
        description: "Training assigned successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error removing training: ", error);
      toaster.create({
        description: "Error removing training",
        type: "error",
      });
    }
  }
  return (
    <Stack spacing={4}>
      {users.map((user) => (
        <Box key={user.Id} p={4} boxShadow="md" borderRadius="lg">
          <Flex justify="space-between" align="start">
            <Box>
              <Text fontWeight="bold">{user.Name}</Text>
              <Text color="gray.600">
                {user.JobTitle} • {user.Email}
              </Text>
            </Box>
            <Text
              color={
                user.Availability.Status === "Available"
                  ? "green.500"
                  : "gray.500"
              }
            >
              {user.Availability.Status}
            </Text>
          </Flex>
          <HStack mt={4} justify="space-between">
            <VStack align="start" width="60%" overflow="hidden">
              <Text fontWeight="semibold">Assigned Trainings</Text>
              <HStack>
                {Object.keys(user).includes("AssignedTrainings") ? (
                  user.AssignedTrainings.map((training) => (
                    <Badge variant="outline" size="md">
                      {training}
                    </Badge>
                  ))
                ) : (
                  <Text></Text>
                )}
              </HStack>
            </VStack>
            <HStack align="end">
              <DialogRoot
                placement="center"
                size="lg"
                scrollBehavior="inside"
                motionPreset="slide-in-top"
              >
                <DialogTrigger asChild>
                  <Button variant="solid">
                    <UserRoundPlus /> Assign Programs
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Employee List</DialogTitle>
                  </DialogHeader>
                  <DialogBody>
                    <VStack gap="2rem">
                      <Stack
                        width="100%"
                        spacing={4}
                        gap="1rem"
                        backgroundColor="bg.muted"
                        borderRadius="10px"
                        padding="1rem"
                        separator={<StackSeparator />}
                      >
                        <Text fontWeight="bold">Careers</Text>
                        {careers.map((career) => (
                          <HStack key={career.id} justify="space-between">
                            <VStack align="start">
                              <Text fontWeight="bold">{career.Title}</Text>
                              <Text color="gray.600">{career.Description}</Text>
                            </VStack>
                            <Button
                              variant="solid"
                              onClick={() =>
                                handleTrainingAssignment(user, career)
                              }
                            >
                              Assign
                            </Button>
                          </HStack>
                        ))}
                      </Stack>

                      <Stack
                        width="100%"
                        spacing={4}
                        gap="1rem"
                        backgroundColor="bg.muted"
                        borderRadius="10px"
                        padding="1rem"
                        separator={<StackSeparator />}
                      >
                        <Text fontWeight="bold">Trainings</Text>
                        {trainings.map((training) => (
                          <HStack key={training.id} justify="space-between">
                            <VStack align="start">
                              <Text fontWeight="bold">{training.Title}</Text>
                              <Text color="gray.600">
                                {training.Description}
                              </Text>
                            </VStack>
                            <Button
                              variant="solid"
                              onClick={() =>
                                handleTrainingAssignment(user, training)
                              }
                            >
                              Assign
                            </Button>
                          </HStack>
                        ))}
                      </Stack>
                    </VStack>
                  </DialogBody>
                  <DialogFooter>
                    <DialogActionTrigger asChild>
                      <Button>Close</Button>
                    </DialogActionTrigger>
                  </DialogFooter>
                  <DialogCloseTrigger />
                </DialogContent>
              </DialogRoot>

              <DialogRoot
                placement="center"
                size="lg"
                scrollBehavior="inside"
                motionPreset="slide-in-top"
              >
                <DialogTrigger asChild>
                  <Button variant="solid">
                    <UserRoundMinus /> Remove
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Training List</DialogTitle>
                  </DialogHeader>
                  <DialogBody>
                    <Stack
                      spacing={4}
                      gap="1rem"
                      separator={<StackSeparator />}
                    >
                      {Object.keys(user).includes("AssignedTrainings") ? (
                        user.AssignedTrainings.map((training) => (
                          <HStack key={training.Id} justify="space-between">
                            <Text fontWeight="bold">{training}</Text>
                            <Button
                              variant="outline"
                              onClick={() =>
                                handleRemoveTraining(user, training)
                              }
                            >
                              remove
                            </Button>
                          </HStack>
                        ))
                      ) : (
                        <Text></Text>
                      )}
                    </Stack>
                  </DialogBody>
                  <DialogFooter>
                    <DialogActionTrigger asChild>
                      <Button>Close</Button>
                    </DialogActionTrigger>
                  </DialogFooter>
                  <DialogCloseTrigger />
                </DialogContent>
              </DialogRoot>
            </HStack>
          </HStack>
        </Box>
      ))}
    </Stack>
  );
}

function TrainingDialog({ refreshData }) {
  const [dialog, setDialog] = useState({ trigger: false, message: "" });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resources, setResources] = useState([]);

  const handleCreateTraining = async () => {
    addDocsToDb("Trainings", {
      Title: title,
      Description: description,
      Resources: resources,
      Status: "Active",
    });

    await refreshData();
    setDialog({
      trigger: true,
      message: "Training program created successfully",
    });
  };

  return (
    <Dialog
      title="Create New Training Program"
      button={
        <Button>
          <BookPlus />
          Add New Training
        </Button>
      }
      body={
        <Stack spacing={4}>
          <InputGroup startElement={<LuUser />}>
            <Input
              placeholder="Training Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </InputGroup>
          <InputGroup startElement={<LuBookOpen />}>
            <Input
              placeholder="Training Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </InputGroup>
          <InputGroup startElement={<LuBookOpen />}>
            <Input
              placeholder="Resources (comma separated)"
              value={resources}
              onChange={(e) => setResources(e.target.value.split(","))}
            />
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
              onClick={() => {
                handleCreateTraining();
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
  );
}

function Dialog({ button, title, body, closeButton }) {
  const [open, setOpen] = useState(false);
  return (
    <DialogRoot
      size="lg"
      placement="center"
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
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

function TrainingStats({ trainings }) {
  return (
    <Flex gap={4}>
      <Box p={4} boxShadow="md" borderRadius="lg" flex={1}>
        <Flex align="center" gap={2}>
          <LuBookOpen />
          <Text fontWeight="bold">Active Trainings</Text>
        </Flex>
        <Text fontSize="2xl" fontWeight="bold" mt={2}>
          {trainings.length}
        </Text>
      </Box>

      <Box p={4} boxShadow="md" borderRadius="lg" flex={1}>
        <Flex align="center" gap={2}>
          <LuBriefcase />
          <Text fontWeight="bold">Skill Resources</Text>
        </Flex>
        <Text fontSize="2xl" fontWeight="bold" mt={2}>
          {trainings.reduce(
            (sum, training) => sum + training.Resources.length,
            0
          )}
        </Text>
      </Box>

      <Box p={4} boxShadow="md" borderRadius="lg" flex={1}>
        <Flex align="center" gap={2}>
          <LuTrendingUp />
          <Text fontWeight="bold">Career Tools</Text>
        </Flex>
        <Text fontSize="2xl" fontWeight="bold" mt={2}>
          {trainings.length}
        </Text>
      </Box>
    </Flex>
  );
}

function TrainingSearch({ searchTerm, setSearchTerm }) {
  return (
    <InputGroup startElement={<LuSearch />}>
      <Input
        placeholder="Search trainings..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </InputGroup>
  );
}

function TrainingListings({ trainings, skills, careers, searchTerm }) {
  return (
    <Stack spacing={4}>
      {trainings
        .filter(
          (training) =>
            training.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            training.Description.toLowerCase().includes(
              searchTerm.toLowerCase()
            )
        )
        .map((training) => (
          <Box key={training.Id} p={4} boxShadow="md" borderRadius="lg">
            <Flex justify="space-between" align="start">
              <Box>
                <Text fontWeight="bold">{training.Title}</Text>
                <Text color="gray.600">{training.Description}</Text>
              </Box>
              <Text
                color={training.Status === "Active" ? "green.500" : "gray.500"}
              >
                {training.Status}
              </Text>
            </Flex>
            <Text mt={4}>{training.Description}</Text>
            <HStack mt={4} spacing={4}>
              <ResourceDialog resources={training.Resources} />
            </HStack>
          </Box>
        ))}
    </Stack>
  );
}

function ResourceDialog({ resources }) {
  const [dialogTrigger, setDialogTrigger] = useState(false);

  return (
    <DialogRoot
      open={dialogTrigger}
      onOpenChange={(e) => setDialogTrigger(e.open)}
    >
      <DialogTrigger asChild>
        <Button variant="solid">
          <LuBookOpen />
          View Resources
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resources</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Stack spacing={4}>
            {resources.map((resource, index) => (
              <Box key={index}>
                {resource.includes("http") ? (
                  <Link href={resource} isExternal color="blue.500">
                    {resource}
                  </Link>
                ) : (
                  <Text>{resource}</Text>
                )}
              </Box>
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
    </DialogRoot>
  );
}

export default ManagementPage;
