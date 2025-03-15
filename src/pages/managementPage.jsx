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
  Heading,
  Link,
  DialogRoot,
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
import { addDocsToDb, getDocsFromDb } from "../firebase";
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
import { ArrowLeft } from "lucide-react";

function ManagementPage({ setDisplayPage }) {
  const [trainings, setTrainings] = useState([]);
  const [skills, setSkills] = useState([]);
  const [careers, setCareers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
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
                Management Dashboard
              </Text>
              <TrainingDialog />
            </Flex>
            <TrainingStats trainings={trainings} />
            <TrainingSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <Separator />
            <TrainingListings
              trainings={trainings}
              skills={skills}
              careers={careers}
              searchTerm={searchTerm}
            />
          </Stack>
        </Container>
      </Container>
    </>
  );
}

function TrainingDialog() {
  const [dialogTrigger, setDialogTrigger] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resources, setResources] = useState([]);

  const handleCreateTraining = () => {
    addDocsToDb("Trainings", {
      Title: title,
      Description: description,
      Resources: resources,
      Status: "Active",
    });

    setDialogTrigger(false);
  };

  return (
    <DialogRoot
      open={dialogTrigger}
      onOpenChange={(e) => setDialogTrigger(e.open)}
    >
      <DialogTrigger asChild>
        <Button leftIcon={<LuPlus />}>Add New Training</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Training Program</DialogTitle>
        </DialogHeader>
        <DialogBody>
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
        </DialogBody>
        <DialogFooter>
          <Button onClick={handleCreateTraining}>
            Create Training Program
          </Button>
        </DialogFooter>
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
        <Button variant="outline" leftIcon={<LuBookOpen />}>
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
