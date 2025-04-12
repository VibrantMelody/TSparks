import { toaster } from "../components/ui/toaster";
import { getDocsFromDb, updateDocInDb } from "../firebase";
import {
  VStack,
  Text,
  Grid,
  Button,
  StackSeparator,
  Container,
  Heading,
  Badge,
  HStack,
  Icon,
  Box,
} from "@chakra-ui/react";
import { MapPin, Building2, Calendar, Send, Trash } from "lucide-react";
import { useCallback, useState, useEffect } from "react";

export default function AvailableJobs({ activeUserID }) {
  const [jobs, setJobs] = useState(undefined);
  const [activeUser, setActiveUser] = useState(undefined);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = useCallback(() => {
    Promise.all([getDocsFromDb("JobListings"), getDocsFromDb("Users")]).then(
      ([jobs, users]) => {
        setJobs(jobs);
        setActiveUser(users.find((user) => user.id === activeUserID));
      }
    );
  }, [activeUserID]);

  async function handleJobApplication(job) {
    try {
      const currentJobApplications = activeUser.CurrentJobApplications;
      if (Object.hasOwn(currentJobApplications, job.id)) {
        toaster.create({
          title: "Already Applied",
          description: "You have already applied for this job.",
          type: "warning",
        });
        return;
      }

      // Update both user and job documents
      await Promise.all([
        // Update user's applications
        updateDocInDb("Users", activeUser.id, {
          CurrentJobApplications: {
            ...currentJobApplications,
            [job.id]: ["Pending"],
          },
        }),
        // Update job's applicants
        updateDocInDb("JobListings", job.id, {
          Applicants: {
            ...job.Applicants,
            [activeUser.id]: ["Pending"],
          },
        }),
      ]);

      toaster.create({
        title: "Successfully Applied",
        description: "You have successfully applied for this job.",
        type: "success",
      });
    } catch (error) {
      console.error("Error", error);
      toaster.create({
        title: "Error Applying",
        description: "Couldn't apply for this job.",
        type: "error",
      });
    } finally {
      refreshData();
    }
  }

  async function handleJobRevocation(jobID) {
    try {
      // Create updated user applications object
      const updatedUserJobs = { ...activeUser.CurrentJobApplications };
      delete updatedUserJobs[jobID];

      // Get current job document to update applicants
      const jobDoc = jobs.find((job) => job.id === jobID);
      const updatedJobApplicants = { ...jobDoc.Applicants };
      delete updatedJobApplicants[activeUser.id];

      // Update both documents simultaneously
      await Promise.all([
        // Remove from user's applications
        updateDocInDb("Users", activeUser.id, {
          CurrentJobApplications: updatedUserJobs,
        }),
        // Remove from job's applicants
        updateDocInDb("JobListings", jobID, {
          Applicants: updatedJobApplicants,
        }),
      ]);

      toaster.create({
        title: "Successfully Revoked",
        description: "Job application revoked successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Error", error);
      toaster.create({
        title: "Error Revoking",
        description: "Couldn't revoke job application.",
        type: "error",
      });
    } finally {
      refreshData();
    }
  }

  if (!jobs || !activeUser) {
    return <Text>Loading...</Text>;
  }

  const availableJobs = jobs.filter((jobs) => {
    if (Object.hasOwn(activeUser, "CurrentJobApplications")) {
      return !Object.hasOwn(activeUser.CurrentJobApplications, jobs.id);
    } else {
      return true;
    }
  });

  const appliedJobs = jobs.filter((jobs) => {
    if (Object.hasOwn(activeUser, "CurrentJobApplications")) {
      return Object.hasOwn(activeUser.CurrentJobApplications, jobs.id);
    } else {
      return false;
    }
  });

  return (
    <VStack width="100%" spacing={8}>
      {/* Applied jobs section */}
      <VStack width="100%" spacing={6}>
        <HStack width="100%" justifyContent="space-between" padding="1rem">
          <Heading size="2xl" fontWeight="bold" color="fg.success">
            Applied Jobs
          </Heading>
          <Text color="gray.fg">
            Showing {appliedJobs.length} available position
            {appliedJobs.length !== 1 && "s"}
          </Text>
        </HStack>

        <Grid
          templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
          gap={6}
          width="100%"
        >
          {appliedJobs.length > 0 &&
            appliedJobs.map((job, index) => (
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
                  align="stretch"
                  height="100%"
                  width="100%"
                  justify="space-between"
                  spacing={4}
                >
                  <VStack align="start" gap={1}>
                    <Badge colorPalette="blue">{job.Department}</Badge>
                    <Heading size="md">{job.Title}</Heading>
                  </VStack>

                  <Text color="gray.fg">{job.Description}</Text>

                  <HStack>
                    <Icon>
                      <MapPin size={16} />
                    </Icon>
                    <Text>{job.Location}</Text>
                  </HStack>

                  <Box>
                    <Text fontWeight="semibold" marginBottom="2">
                      Requirements:
                    </Text>
                    {job.Requirements?.map((req, idx) => (
                      <HStack key={idx} paddingY="1">
                        <Icon color="green.fg">
                          <Building2 size={16} />
                        </Icon>
                        <Text>{req}</Text>
                      </HStack>
                    ))}
                  </Box>

                  <VStack gap={2}>
                    <HStack width="100%" justifyContent="space-between">
                      <HStack>
                        <Icon>
                          <Calendar size={16} />
                        </Icon>
                        <Text fontSize="sm">Start: {job.StartDate}</Text>
                      </HStack>
                      <Text fontSize="sm" color="red.fg">
                        End: {job.EndDate}
                      </Text>
                    </HStack>

                    <Button
                      width="100%"
                      size="lg"
                      colorPalette="red"
                      onClick={() => handleJobRevocation(job.id)}
                    >
                      <Trash />
                      Revoke Application
                    </Button>
                    <Badge size="lg" width="100%" colorPalette="blue">
                      <Text>
                        {activeUser.CurrentJobApplications[job.id][0]}
                      </Text>
                    </Badge>
                  </VStack>
                </VStack>
              </Container>
            ))}
        </Grid>
      </VStack>
      {/* available jobs section */}
      <VStack width="100%" spacing={6}>
        <HStack width="100%" justifyContent="space-between" padding="1rem">
          <Heading size="2xl" fontWeight="bold" color="fg.info">
            Available Jobs
          </Heading>
          <Text color="gray.fg">
            Showing {availableJobs.length} available position
            {availableJobs.length !== 1 && "s"}
          </Text>
        </HStack>

        <Grid
          templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
          gap={6}
          width="100%"
        >
          {availableJobs.length > 0 &&
            availableJobs.map((job, index) => (
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
                  align="stretch"
                  height="100%"
                  width="100%"
                  justify="space-between"
                  spacing={4}
                >
                  <VStack align="start" gap={1}>
                    <Badge colorPalette="blue">{job.Department}</Badge>
                    <Heading size="md">{job.Title}</Heading>
                  </VStack>

                  <Text color="gray.fg">{job.Description}</Text>

                  <HStack>
                    <Icon>
                      <MapPin size={16} />
                    </Icon>
                    <Text>{job.Location}</Text>
                  </HStack>

                  <Box>
                    <Text fontWeight="semibold" marginBottom="2">
                      Requirements:
                    </Text>
                    {job.Requirements?.map((req, idx) => (
                      <HStack key={idx} paddingY="1">
                        <Icon color="green.fg">
                          <Building2 size={16} />
                        </Icon>
                        <Text>{req}</Text>
                      </HStack>
                    ))}
                  </Box>

                  <VStack gap={2}>
                    <HStack width="100%" justifyContent="space-between">
                      <HStack>
                        <Icon>
                          <Calendar size={16} />
                        </Icon>
                        <Text fontSize="sm">Start: {job.StartDate}</Text>
                      </HStack>
                      <Text fontSize="sm" color="red.fg">
                        End: {job.EndDate}
                      </Text>
                    </HStack>

                    <Button
                      width="100%"
                      size="lg"
                      colorPalette="blue"
                      onClick={() => handleJobApplication(job)}
                    >
                      <Send />
                      Apply Now
                    </Button>
                  </VStack>
                </VStack>
              </Container>
            ))}
        </Grid>
      </VStack>
    </VStack>
  );
}
