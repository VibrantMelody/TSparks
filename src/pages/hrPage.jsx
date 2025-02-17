import { useState, useEffect } from "react";
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
} from "react-icons/lu";
import { addDocsToDb, getDocsFromDb } from "../firebase";
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

function HRPage() {
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({
    Title: "",
    Department: "",
    Location: "",
    Description: "",
    Requirements: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogTrigger, setDialogTrigger] = useState(false);
  const [activeView, setActiveView] = useState("Listings");

  useEffect(() => {
    getDocsFromDb("JobListings").then((jobListings) => {
      setJobs(jobListings);
    });
  }, []);

  const handleCreateJob = () => {
    addDocsToDb("JobListings", {
      ...newJob,
      Status: "Active",
      Applications: 0,
      Requirements: newJob.requirements.split("\n"),
      Applicants: [],
    });
    setNewJob({
      Title: "",
      Department: "",
      Location: "",
      Description: "",
      Requirements: "",
    });
    setDialogTrigger(false);
  };

  return (
    <Container height="100vh" width="100vw" padding="2rem">
      <Container maxW="full">
        <Stack spacing={6} width="100%">
          <Flex justify="space-between" align="center">
            <Text textStyle="2xl" fontWeight="bold">
              HR Dashboard
            </Text>
            <JobDialog
              dialogTrigger={dialogTrigger}
              setDialogTrigger={setDialogTrigger}
              newJob={newJob}
              setNewJob={setNewJob}
              handleCreateJob={handleCreateJob}
            />
          </Flex>

          <JobStats jobs={jobs} />

          <JobSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <SegmentedControl
            cursor="pointer"
            size="md"
            defaultValue={activeView}
            value={activeView}
            onValueChange={(e) => setActiveView(e.value)}
            items={["Listings", "Applications", "Communications"]}
          />

          <Separator />

          {activeView === "Listings" && (
            <Listings jobs={jobs} searchTerm={searchTerm} />
          )}
          {activeView === "Applications" && <Applications jobs={jobs} />}
          {activeView === "Communications" && <Communications jobs={jobs} />}
        </Stack>
      </Container>
    </Container>
  );
}

function JobDialog({
  dialogTrigger,
  setDialogTrigger,
  newJob,
  setNewJob,
  handleCreateJob,
}) {
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
                value={newJob.Title}
                onChange={(e) =>
                  setNewJob({ ...newJob, Title: e.target.value })
                }
              />
            </InputGroup>
            <InputGroup startElement={<LuBuilding2 />}>
              <Input
                placeholder="Department"
                value={newJob.Department}
                onChange={(e) =>
                  setNewJob({ ...newJob, Department: e.target.value })
                }
              />
            </InputGroup>
            <InputGroup startElement={<LuBuilding2 />}>
              <Input
                placeholder="Location"
                value={newJob.Location}
                onChange={(e) =>
                  setNewJob({ ...newJob, Location: e.target.value })
                }
              />
            </InputGroup>
            <InputGroup startElement={<LuFileText />}>
              <Input
                placeholder="Description"
                value={newJob.Description}
                onChange={(e) =>
                  setNewJob({ ...newJob, Description: e.target.value })
                }
              />
            </InputGroup>
            <InputGroup startElement={<LuFileText />}>
              <Input
                placeholder="Requirements (comma separated)"
                value={newJob.Requirements}
                onChange={(e) =>
                  setNewJob({ ...newJob, Requirements: e.target.value })
                }
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

function JobStats({ jobs }) {
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
    </Flex>
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

function Listings({ jobs, searchTerm }) {
  return (
    <Stack spacing={4}>
      {jobs
        .filter(
          (job) =>
            job.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.Department.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((job) => (
          <Box key={job.Id} p={4} boxShadow="md" borderRadius="lg">
            <Flex justify="space-between" align="start">
              <Box>
                <Text fontWeight="bold">{job.Title}</Text>
                <Text color="gray.600">
                  {job.Department} • {job.Location}
                </Text>
              </Box>
              <Text color={job.Status === "Active" ? "green.500" : "gray.500"}>
                {job.status}
              </Text>
            </Flex>
            <Text mt={4}>{job.description}</Text>
            <HStack mt={4} spacing={4}>
              <Button variant="outline" leftIcon={<LuUsers />}>
                {job.Applications.length} Applications
              </Button>
              <Button variant="outline" leftIcon={<LuMail />}>
                Email Candidates
              </Button>
              <Button variant="outline" leftIcon={<LuMessageSquare />}>
                Send Update
              </Button>
            </HStack>
          </Box>
        ))}
    </Stack>
  );
}

function Applications({ jobs }) {
  return (
    <Stack spacing={4}>
      {jobs.map((job) => (
        <Box key={job.id} p={4} boxShadow="md" borderRadius="lg">
          <Text fontWeight="bold" mb={2}>
            {job.Title}
          </Text>
          <Stack spacing={2}>
            {job.Applicants.map((applicant) => (
              <Flex
                key={Applicant.id}
                justify="space-between"
                align="center"
                p={2}
                bg="gray.50"
                borderRadius="md"
              >
                <Text>{applicant.name}</Text>
                <HStack>
                  <Text color="gray.500">{applicant.status}</Text>
                  <Button size="sm" variant="ghost">
                    Review
                  </Button>
                </HStack>
              </Flex>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

function Communications({ jobs }) {
  return (
    <Stack spacing={4}>
      <Button leftIcon={<LuMail />}>Send Bulk Update</Button>
      <Stack spacing={2}>
        {jobs.map((job) => (
          <Box key={job.id} p={4} boxShadow="md" borderRadius="lg">
            <Text fontWeight="bold" mb={2}>
              {job.Title}
            </Text>
            <HStack>
              <Button size="sm" variant="outline">
                Send Interview Invites
              </Button>
              <Button size="sm" variant="outline">
                Request Additional Info
              </Button>
            </HStack>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}

export default HRPage;
