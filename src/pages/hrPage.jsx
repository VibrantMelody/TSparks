import { useState, useEffect, useCallback } from "react";
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
import { SegmentedControl } from "../components/ui/segmented-control";
import { InputGroup } from "../components/ui/input-group";
import { ArrowLeft, CornerDownLeft } from "lucide-react";

function HRPage({ setDisplayPage }) {
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
    <>
      <Button
        variant="ghost"
        position="absolute"
        top="1rem"
        left="1rem"
        zIndex="max"
        scale="1.5"
        onClick={() => setDisplayPage("Login")}
      >
        <ArrowLeft />
      </Button>
      <Container height="100vh" width="100vw" padding="2rem" overflow="auto">
        <Container maxW="full" width="100%" overflow="auto">
          <Stack spacing={6} width="100%">
            <Flex justify="space-between" align="center">
              <Text textStyle="2xl" fontWeight="bold">
                HR Dashboard
              </Text>
              <JobDialog refreshData={refreshData} />
            </Flex>
            <JobStats jobs={jobs} users={users} refreshData={refreshData} />
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
        </Container>
      </Container>
    </>
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

  return (
    <DialogRoot
      open={dialogTrigger}
      onOpenChange={(e) => setDialogTrigger(e.open)}
      size="cover"
      scrollBehavior="inside"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Employees</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Stack spacing={4}>
            {users.map((user, index) => (
              <Flex key={index} justify="space-between" align="center">
                <Text>{user.Name}</Text>
                <Text color="blue.fg">{user.Email}</Text>
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
                    colorPalette="green"
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
