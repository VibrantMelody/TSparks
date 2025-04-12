import { toaster } from "../components/ui/toaster";
import { getDocsFromDb, updateDocInDb } from "../firebase";
import {
  VStack,
  Text,
  Grid,
  Button,
  Container,
  Heading,
  Badge,
  HStack,
  Icon,
  Box,
  Progress,
  Link,
} from "@chakra-ui/react";
import { BookOpen, Clock, CheckCircle, FileText, Trash } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

export default function Learnings({ activeUserID }) {
  const [learnings, setLearnings] = useState(undefined);
  const [activeUser, setActiveUser] = useState(undefined);

  // Fetch all learnings and user data
  const refreshLearnings = useCallback(() => {
    Promise.all([getDocsFromDb("Learnings"), getDocsFromDb("Users")])
      .then(([learnings, users]) => {
        setLearnings(learnings);
        setActiveUser(users.find((user) => user.id === activeUserID));
      })
      .catch((error) => {
        console.error("Error fetching learnings:", error);
        toaster.create({
          title: "Error Loading Learnings",
          description: "Could not load learning resources.",
          type: "error",
        });
      });
  }, [activeUserID]);

  useEffect(() => {
    refreshLearnings();
  }, []);

  // Handle assigning a new learning
  async function handleLearningClick(learningID) {
    let currentLearnings = {};
    try {
      if (Object.hasOwn(activeUser, "AssignedLearnings")) {
        currentLearnings = activeUser.AssignedLearnings;
        if (Object.hasOwn(currentLearnings, learningID)) {
          toaster.create({
            title: "Already Assigned",
            description: "This course is already assigned to you.",
            type: "warning",
          });
          return;
        }
      }

      // Update user's assigned learnings
      await Promise.all([
        // Update user document
        updateDocInDb("Users", activeUser.id, {
          AssignedLearnings: {
            ...currentLearnings,
            [learningID]: ["Self-Assigned", "Not Completed"],
          },
        }),
        // Update learning document with assignment
        updateDocInDb("Learnings", learningID, {
          AssignedTo: {
            ...currentLearnings?.[learningID]?.AssignedTo,
            [activeUser.id]: ["Self-Assigned", "Not Completed"],
          },
        }),
      ]);

      toaster.create({
        title: "Learning Assigned",
        description: "You have been assigned a new course.",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating learning:", error);
      toaster.create({
        title: "Error Assigning Learning",
        description: "There was an error assigning the learning.",
        type: "error",
      });
    } finally {
      refreshLearnings();
    }
  }

  // Handle marking a learning as complete/incomplete
  async function handleLearningCompletion(isCompleted, learning) {
    try {
      await Promise.all([
        // Update user's completion status
        updateDocInDb("Users", activeUser.id, {
          AssignedLearnings: {
            ...activeUser.AssignedLearnings,
            [learning.id]: [
              activeUser.AssignedLearnings[learning.id][0],
              isCompleted ? "Completed" : "Not Completed",
            ],
          },
        }),
        // Update learning's completion status
        updateDocInDb("Learnings", learning.id, {
          AssignedTo: {
            ...learning.AssignedTo,
            [activeUser.id]: [
              learning.AssignedTo[activeUser.id][0],
              isCompleted ? "Completed" : "Not Completed",
            ],
          },
        }),
      ]);

      toaster.create({
        title: "Learning Status Updated",
        description: `Learning marked as ${
          isCompleted ? "completed" : "not completed"
        }.`,
        type: "success",
      });
    } catch (error) {
      console.error("Error updating learning status:", error);
      toaster.create({
        title: "Error Updating Learning",
        description: "There was an error updating the learning status.",
        type: "error",
      });
    } finally {
      refreshLearnings();
    }
  }

  // Handle removing a learning assignment
  async function handleLearningRemoval(learningID) {
    try {
      // Remove from user's assignments
      const updatedUserLearnings = { ...activeUser.AssignedLearnings };
      delete updatedUserLearnings[learningID];

      // Remove from learning's assignments
      const learning = learnings.find((l) => l.id === learningID);
      const updatedLearningAssignments = { ...learning.AssignedTo };
      delete updatedLearningAssignments[activeUser.id];

      await Promise.all([
        updateDocInDb("Users", activeUser.id, {
          AssignedLearnings: updatedUserLearnings,
        }),
        updateDocInDb("Learnings", learningID, {
          AssignedTo: updatedLearningAssignments,
        }),
      ]);

      toaster.create({
        title: "Learning Removed",
        description: "Learning removed from your assigned courses.",
        type: "success",
      });
    } catch (error) {
      console.error("Error removing learning:", error);
      toaster.create({
        title: "Error Removing Learning",
        description: "There was an error removing the learning.",
        type: "error",
      });
    } finally {
      refreshLearnings();
    }
  }

  // Loading state
  if (!learnings || !activeUser) {
    return <Text>Loading...</Text>;
  }

  // Filter available and assigned learnings
  const availableLearnings = learnings.filter((learning) => {
    if (Object.hasOwn(activeUser, "AssignedLearnings")) {
      return !Object.hasOwn(activeUser.AssignedLearnings, learning.id);
    }
    return true;
  });

  const assignedLearnings = learnings.filter((learning) => {
    if (Object.hasOwn(activeUser, "AssignedLearnings")) {
      return Object.hasOwn(activeUser.AssignedLearnings, learning.id);
    }
    return false;
  });

  return (
    <VStack width="100%" spacing={8}>
      {/* Assigned Courses Section */}
      <VStack width="100%" spacing={6}>
        <Heading size="2xl" color="fg.success" fontWeight="bold">
          Assigned Courses
        </Heading>

        <Grid
          templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
          gap={6}
          width="100%"
        >
          {assignedLearnings.length > 0 &&
            assignedLearnings.map((learning, index) => (
              <Container
                key={index}
                p={6}
                boxShadow="lg"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="red.border"
                _hover={{
                  transform: "translateY(-2px)",
                  transition: "transform 0.2s",
                }}
              >
                <VStack
                  width="100%"
                  height="100%"
                  align="stretch"
                  justify="space-between"
                  spacing={4}
                >
                  <Text fontSize="sm" color="gray.fg">
                    Due: {learning.dueDate || "No deadline"}
                  </Text>

                  <VStack align="start" gap={1}>
                    <Badge
                      colorPalette={
                        learning.category === "Technical"
                          ? "blue"
                          : learning.category === "Leadership"
                          ? "purple"
                          : learning.category === "Soft Skills"
                          ? "green"
                          : "orange"
                      }
                    >
                      {learning.category}
                    </Badge>
                    <Heading size="md">{learning.title}</Heading>
                  </VStack>

                  <Text color="gray.fg">{learning.description}</Text>

                  <Box>
                    <Text fontSize="sm" color="gray.fg">
                      Assigned by: {learning.assignedBy}
                    </Text>
                    <Text fontSize="sm" color="gray.fg">
                      Date Assigned: {learning.dateAssigned}
                    </Text>
                  </Box>

                  {learning.Resources && learning.Resources.length > 0 && (
                    <Container>
                      <Text fontWeight="semibold" marginBottom="2">
                        Learning Materials:
                      </Text>
                      <VStack align="start" overflow="hidden">
                        {learning.Resources.map((resource, idx) => (
                          <Link
                            key={idx}
                            href={resource}
                            isExternal
                            color="fg.info"
                          >
                            <FileText size={16} />
                            {resource}
                          </Link>
                        ))}
                      </VStack>
                    </Container>
                  )}

                  {activeUser.AssignedLearnings[learning.id][1] ===
                  "Not Completed" ? (
                    <Button
                      width="100%"
                      size="lg"
                      colorPalette="green"
                      onClick={() => handleLearningCompletion(true, learning)}
                    >
                      <CheckCircle size={16} color="green" />
                      <Text ml={2}>Mark as Completed</Text>
                    </Button>
                  ) : (
                    <VStack>
                      <Button
                        width="100%"
                        size="lg"
                        colorPalette="black"
                        onClick={() =>
                          handleLearningCompletion(false, learning)
                        }
                      >
                        <CheckCircle />
                        <Text ml={2}>Completed</Text>
                      </Button>

                      <Button
                        width="100%"
                        size="lg"
                        colorPalette="red"
                        onClick={() => handleLearningRemoval(learning.id)}
                      >
                        <Trash />
                        <Text ml={2}>Remove</Text>
                      </Button>
                    </VStack>
                  )}
                  <Badge colorPalette="red" size="lg">
                    {activeUser.AssignedLearnings[learning.id][0]}
                  </Badge>
                </VStack>
              </Container>
            ))}
        </Grid>
      </VStack>

      <Box width="100%" height="1px" backgroundColor="gray.border" />

      {/* Available Resources Section */}
      <VStack width="100%" spacing={6}>
        <HStack width="100%" justifyContent="space-between" padding="1rem">
          <Heading size="2xl" fontWeight="bold" color="fg.info">
            Available Resources
          </Heading>
          <Text color="gray.fg">
            {availableLearnings.length} courses available
          </Text>
        </HStack>

        <Grid
          templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
          gap={6}
          width="100%"
        >
          {availableLearnings.length > 0 &&
            availableLearnings.map((learning, index) => (
              <Container
                key={index}
                p={6}
                boxShadow="lg"
                borderRadius="xl"
                _hover={{
                  transform: "translateY(-2px)",
                  transition: "transform 0.2s",
                }}
              >
                <VStack
                  width="100%"
                  height="100%"
                  align="stretch"
                  justify="space-between"
                  spacing={4}
                >
                  <VStack align="start" gap={1}>
                    <Badge
                      colorPalette={
                        learning.category === "Technical"
                          ? "blue"
                          : learning.category === "Leadership"
                          ? "purple"
                          : learning.category === "Soft Skills"
                          ? "green"
                          : "orange"
                      }
                    >
                      {learning.category}
                    </Badge>
                    <Heading size="md">{learning.title}</Heading>
                  </VStack>

                  <Text color="gray.fg">{learning.description}</Text>

                  <Box>
                    <HStack justify="space-between" marginBottom="2">
                      <HStack>
                        <Icon>
                          <Clock size={16} />
                        </Icon>
                        <Text fontSize="sm">{learning.duration}</Text>
                      </HStack>
                      <Badge
                        colorPalette={
                          learning.difficulty === "Beginner"
                            ? "green"
                            : learning.difficulty === "Intermediate"
                            ? "yellow"
                            : "red"
                        }
                      >
                        {learning.difficulty}
                      </Badge>
                    </HStack>
                  </Box>

                  {learning.Resources && learning.Resources.length > 0 && (
                    <Container>
                      <Text fontWeight="semibold" marginBottom="2">
                        Learning Materials:
                      </Text>
                      <VStack align="start" overflow="hidden">
                        {learning.Resources.map((resource, idx) => (
                          <Link
                            key={idx}
                            href={resource}
                            isExternal
                            color="fg.info"
                          >
                            <FileText size={16} />
                            {resource}
                          </Link>
                        ))}
                      </VStack>
                    </Container>
                  )}

                  <Button
                    width="100%"
                    size="lg"
                    colorPalette="blue"
                    onClick={() => handleLearningClick(learning.id)}
                  >
                    <BookOpen size={16} />
                    <Text ml={2}>Start Learning</Text>
                  </Button>
                </VStack>
              </Container>
            ))}
        </Grid>
      </VStack>
    </VStack>
  );
}
