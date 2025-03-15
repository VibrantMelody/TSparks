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
} from "@chakra-ui/react";
import { getAuth } from "firebase/auth";
import { getDocsFromDb } from "../firebase";
import {
  LuUser,
  LuMail,
  LuBriefcase,
  LuBookOpen,
  LuLogOut,
} from "react-icons/lu";
import { ArrowLeft } from "lucide-react";

function EmployeePage({ setDisplayPage }) {
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [trainings, setTrainings] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      getDocsFromDb("Users").then((users) => {
        const userDetails = users.find((u) => u.id === user.uid);
        setEmployeeDetails(userDetails);
      });

      getDocsFromDb("Feedbacks").then((feedbackList) => {
        const userFeedbacks = feedbackList.filter(
          (feedback) => feedback.UserID === user.uid
        );
        setFeedbacks(userFeedbacks);
      });

      getDocsFromDb("Trainings").then((trainingList) => {
        const userTrainings = trainingList.filter((training) =>
          training.AssignedEmployees.includes(user.uid)
        );
        setTrainings(userTrainings);
      });
    }
  }, []);

  if (!employeeDetails) {
    return <Text>Loading...</Text>;
  }

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
                Employee Dashboard
              </Text>
            </Flex>
            <EmployeeDetails details={employeeDetails} />
            <Separator />
            <FeedbackListings feedbacks={feedbacks} />
            <Separator />
            <TrainingListings trainings={trainings} />
          </Stack>
        </Container>
      </Container>
    </>
  );
}

function EmployeeDetails({ details }) {
  return (
    <Box p={4} boxShadow="md" borderRadius="lg">
      <Heading size="md">Employee Details</Heading>
      <Stack spacing={4} mt={4}>
        <Flex align="center">
          <LuUser />
          <Text ml={2}>{details.Name}</Text>
        </Flex>
        <Flex align="center">
          <LuMail />
          <Text ml={2}>{details.Email}</Text>
        </Flex>
        <Flex align="center">
          <LuBriefcase />
          <Text ml={2}>{details.Position}</Text>
        </Flex>
      </Stack>
    </Box>
  );
}

function FeedbackListings({ feedbacks }) {
  return (
    <Box p={4} boxShadow="md" borderRadius="lg">
      <Heading size="md">Feedback</Heading>
      <Stack spacing={4} mt={4}>
        {feedbacks.map((feedback) => (
          <Box key={feedback.id} p={4} boxShadow="md" borderRadius="lg">
            <Text fontWeight="bold">{feedback.Title}</Text>
            <Text>{feedback.Description}</Text>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function TrainingListings({ trainings }) {
  return (
    <Box p={4} boxShadow="md" borderRadius="lg">
      <Heading size="md">Assigned Trainings</Heading>
      <Stack spacing={4} mt={4}>
        {trainings.map((training) => (
          <Box key={training.id} p={4} boxShadow="md" borderRadius="lg">
            <Text fontWeight="bold">{training.Title}</Text>
            <Text>{training.Description}</Text>
            <HStack mt={4} spacing={4}>
              <ResourceDialog resources={training.Resources} />
            </HStack>
          </Box>
        ))}
      </Stack>
    </Box>
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

export default EmployeePage;
