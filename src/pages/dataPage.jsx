import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import _ from "lodash";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  Container,
  Stat,
  FormatNumber,
  List,
} from "@chakra-ui/react";
import { CheckCircle, CircleCheck } from "lucide-react";
import { useColorModeValue } from "../components/ui/color-mode";

const WorkforceAnalytics = ({ data }) => {
  const [metrics, setMetrics] = useState({
    composition: [],
    departmentDistribution: [],
    locationDistribution: [],
    performanceMetrics: {},
    trainingDistribution: [],
    certificationRate: 0,
    turnoverRisk: {},
    availabilityStatus: [],
  });

  useEffect(() => {
    if (!data || !data.length) return;

    calculateMetrics(data);
  }, [data]);

  const calculateMetrics = (employeeData) => {
    // Workforce Composition
    const roleCount = _.countBy(employeeData, "Role");
    const roleComposition = Object.keys(roleCount).map((role) => ({
      name: role,
      value: (roleCount[role] / employeeData.length) * 100,
    }));

    // Department Distribution
    const deptCount = _.countBy(employeeData, "Department");
    const deptDistribution = Object.keys(deptCount).map((dept) => ({
      name: dept,
      count: deptCount[dept],
      percentage: (deptCount[dept] / employeeData.length) * 100,
    }));

    // Location Distribution
    const locCount = _.countBy(employeeData, "Location");
    const locationDistribution = Object.keys(locCount).map((loc) => ({
      name: loc,
      count: locCount[loc],
      percentage: (locCount[loc] / employeeData.length) * 100,
    }));

    // Performance Metrics
    const avgRating = _.meanBy(employeeData, "Rating");
    const experienceYears = _.meanBy(employeeData, "YearsOfExperience");

    // Certification Analysis
    const withCertification = employeeData.filter(
      (emp) =>
        emp.Certifications &&
        emp.Certifications.length > 0 &&
        emp.Certifications[0] !== ""
    ).length;
    const certificationRate = (withCertification / employeeData.length) * 100;

    // Training Distribution
    const allTrainings = employeeData.flatMap(
      (emp) => emp.AssignedTrainings || []
    );
    const trainingCount = _.countBy(allTrainings);
    const trainingDistribution = Object.keys(trainingCount)
      .map((training) => ({
        name: training,
        count: trainingCount[training],
      }))
      .filter((t) => t.name); // Filter out undefined or empty

    // Turnover Risk Analysis
    const applyingForJobs = employeeData.filter(
      (emp) =>
        emp.CurrentJobApplications && emp.CurrentJobApplications.length > 0
    ).length;

    const highRiskEmployees = employeeData.filter(
      (emp) => emp.CurrentJobApplications?.length > 0 && emp.Rating < 4
    ).length;

    const deptApplications = {};
    employeeData.forEach((emp) => {
      if (emp.CurrentJobApplications?.length > 0) {
        deptApplications[emp.Department] =
          (deptApplications[emp.Department] || 0) + 1;
      }
    });

    // Availability Status
    const availabilityStatus = [
      {
        name: "Available",
        value: employeeData.filter(
          (emp) =>
            emp.Availability?.Status === "Available" ||
            emp.Availability?.status === "Available"
        ).length,
      },
      {
        name: "On Leave",
        value: employeeData.filter(
          (emp) => emp.Availability?.Status === "On Leave"
        ).length,
      },
      {
        name: "Not Available",
        value: employeeData.filter(
          (emp) => emp.Availability?.Status === "Not Available"
        ).length,
      },
    ];

    setMetrics({
      composition: roleComposition,
      departmentDistribution: deptDistribution,
      locationDistribution: locationDistribution,
      performanceMetrics: {
        avgRating,
        experienceYears,
      },
      trainingDistribution,
      certificationRate,
      turnoverRisk: {
        applyingPercentage: (applyingForJobs / employeeData.length) * 100,
        highRiskPercentage: (highRiskEmployees / employeeData.length) * 100,
        departmentApplications: Object.keys(deptApplications).map((dept) => ({
          name: dept,
          count: deptApplications[dept],
        })),
      },
      availabilityStatus,
    });
  };

  // Colors for charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  // Chakra UI color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const subtextColor = useColorModeValue("gray.600", "gray.400");

  return (
    <Box bg={bgColor} borderRadius="lg" w="full" p={6}>
      <Flex direction="column" align="center" mb={8}>
        <Heading fontWeight="bolder" color={textColor} mb={2}>
          Workforce Analytics Dashboard
        </Heading>
        <Text color={subtextColor} fontWeight="semibold">
          Analysis of {data?.length || 0} employees
        </Text>
      </Flex>

      {/* Main Dashboard Grid */}
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
        gap={6}
        fontSize="md"
      >
        {/* Workforce Composition */}
        <Box
          bg={cardBgColor}
          p={4}
          borderRadius="lg"
          boxShadow="sm"
          border="1px"
          borderColor={borderColor}
        >
          <Heading as="h2" size="md" mb={4}>
            Workforce Composition
          </Heading>
          <Box h="256px">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.composition}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {metrics.composition.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          <List.Root mt={4} variant="plain">
            <List.Item>
              <List.Indicator asChild color="green.500">
                <CircleCheck />
              </List.Indicator>
              {(
                metrics.composition.find((r) => r.name === "Employee")?.value ||
                0
              ).toFixed(0)}
              % in standard employee roles
            </List.Item>
            <List.Item>
              <List.Indicator as={CheckCircle} color="green.500" />
              {(
                metrics.composition.find((r) => r.name === "HR")?.value || 0
              ).toFixed(0)}
              % in HR
            </List.Item>
            <List.Item>
              <List.Indicator as={CheckCircle} color="green.500" />
              {(
                metrics.composition.find((r) => r.name === "Upper Management")
                  ?.value || 0
              ).toFixed(0)}
              % in upper management
            </List.Item>
          </List.Root>
        </Box>

        {/* Department Distribution */}
        <Box
          bg={cardBgColor}
          p={4}
          borderRadius="lg"
          boxShadow="sm"
          border="1px"
          borderColor={borderColor}
        >
          <Heading as="h2" size="md" mb={4}>
            Department Distribution
          </Heading>
          <Box h="256px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.departmentDistribution}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} employees`} />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <List.Root spacing={2} mt={4} variant="plain">
            <List.Item>
              <List.Indicator as={CheckCircle} color="green.500" />
              Engineering is the largest department (
              {metrics.departmentDistribution
                .find((d) => d.name === "Engineering")
                ?.percentage.toFixed(0) || 0}
              % of workforce)
            </List.Item>
          </List.Root>
        </Box>

        {/* Location Distribution */}
        <Box
          bg={cardBgColor}
          p={4}
          borderRadius="lg"
          boxShadow="sm"
          border="1px"
          borderColor={borderColor}
        >
          <Heading as="h2" size="md" mb={4}>
            Location Distribution
          </Heading>
          <Box h="256px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.locationDistribution}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} employees`} />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <List.Root spacing={2} mt={4} variant="plain">
            <List.Item>
              <List.Indicator as={CheckCircle} color="green.500" />
              {(
                metrics.locationDistribution.find((l) => l.name === "Remote")
                  ?.percentage || 0
              ).toFixed(0)}
              % of employees work remotely
            </List.Item>
            <List.Item>
              <List.Indicator as={CheckCircle} color="green.500" />
              {metrics.locationDistribution
                .filter((l) => l.name !== "Remote")
                .sort((a, b) => b.count - a.count)[0]?.name || "N/A"}{" "}
              is the most common office location
            </List.Item>
          </List.Root>
        </Box>

        {/* Performance & Development */}
        <Box
          bg={cardBgColor}
          p={4}
          borderRadius="lg"
          boxShadow="sm"
          border="1px"
          borderColor={borderColor}
        >
          <Heading as="h2" size="md" mb={4}>
            Performance & Development
          </Heading>
          <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={4}>
            <Box bg="blue.50" p={4} borderRadius="lg" textAlign="center">
              <Stat.Root>
                <Stat.Label color="blue.700">Avg Rating</Stat.Label>
                <Stat.ValueText color="blue.800">
                  {metrics.performanceMetrics.avgRating?.toFixed(1) || "N/A"}
                </Stat.ValueText>
                <Stat.HelpText color="blue.600">out of 5.0</Stat.HelpText>
              </Stat.Root>
            </Box>
            <Box bg="green.50" p={4} borderRadius="lg" textAlign="center">
              <Stat.Root>
                <Stat.Label color="green.700">Avg Experience</Stat.Label>
                <Stat.ValueText color="green.800">
                  {metrics.performanceMetrics.experienceYears?.toFixed(1) ||
                    "N/A"}
                </Stat.ValueText>
                <Stat.HelpText color="green.600">years</Stat.HelpText>
              </Stat.Root>
            </Box>
          </Grid>
          <List.Root spacing={2} mt={4} variant="plain">
            <List.Item>
              <List.Indicator as={CheckCircle} color="green.500" />
              Strong overall performance with an average rating of{" "}
              {metrics.performanceMetrics.avgRating?.toFixed(1) || "N/A"}/5.0
            </List.Item>
            <List.Item>
              <List.Indicator as={CheckCircle} color="green.500" />
              {metrics.certificationRate?.toFixed(0) || 0}% of employees have at
              least one professional certification
            </List.Item>
            <List.Item>
              <List.Indicator as={CheckCircle} color="green.500" />
              Average experience level is{" "}
              {metrics.performanceMetrics.experienceYears?.toFixed(1) ||
                "N/A"}{" "}
              years
            </List.Item>
          </List.Root>
        </Box>

        {/* Training Effectiveness */}
        <Box
          bg={cardBgColor}
          p={4}
          borderRadius="lg"
          boxShadow="sm"
          border="1px"
          borderColor={borderColor}
        >
          <Heading as="h2" size="md" mb={4}>
            Training Effectiveness
          </Heading>
          <Box h="256px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.trainingDistribution
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Bar dataKey="count" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <List.Root spacing={2} mt={4} variant="plain">
            <List.Item>
              <List.Indicator as={CheckCircle} color="green.500" />
              Top 3 training programs:{" "}
              {metrics.trainingDistribution
                .sort((a, b) => b.count - a.count)
                .slice(0, 3)
                .map((t) => t.name)
                .join(", ")}
            </List.Item>
            <List.Item>
              <List.Indicator as={CheckCircle} color="green.500" />
              {metrics.certificationRate?.toFixed(0) || 0}% of employees have
              professional certifications
            </List.Item>
          </List.Root>
        </Box>

        {/* Turnover Risk Analysis */}
        <Box
          bg={cardBgColor}
          p={4}
          borderRadius="lg"
          boxShadow="sm"
          border="1px"
          borderColor={borderColor}
        >
          <Heading as="h2" size="md" mb={4}>
            Turnover Risk Analysis
          </Heading>
          <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={4}>
            <Box bg="yellow.50" p={4} borderRadius="lg" textAlign="center">
              <Stat.Root>
                <Stat.Label color="yellow.700">Job Applications</Stat.Label>
                <Stat.ValueText color="yellow.800">
                  {metrics.turnoverRisk.applyingPercentage?.toFixed(0) || 0}%
                </Stat.ValueText>
                <Stat.HelpText color="yellow.600">of employees</Stat.HelpText>
              </Stat.Root>
            </Box>
            <Box bg="red.50" p={4} borderRadius="lg" textAlign="center">
              <Stat.Root>
                <Stat.Label color="red.700">High Risk</Stat.Label>
                <Stat.ValueText color="red.800">
                  {metrics.turnoverRisk.highRiskPercentage?.toFixed(0) || 0}%
                </Stat.ValueText>
                <Stat.HelpText color="red.600">
                  applying + low rating
                </Stat.HelpText>
              </Stat.Root>
            </Box>
          </Grid>

          <Heading as="h3" size="sm" mt={4} mb={2}>
            Applications by Department
          </Heading>
          <Box h="160px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.turnoverRisk.departmentApplications}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* Availability & Resource Planning */}
        <Box
          bg={cardBgColor}
          p={4}
          borderRadius="lg"
          boxShadow="sm"
          border="1px"
          borderColor={borderColor}
        >
          <Heading as="h2" size="md" mb={4}>
            Availability & Resource Planning
          </Heading>
          <Box h="256px">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.availabilityStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {metrics.availabilityStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={["#4CAF50", "#FFC107", "#F44336"][index % 3]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          <List.Root spacing={2} mt={4} variant="plain">
            <List.Item>
              <List.Indicator as={CheckCircle} color="green.500" />
              {(
                (metrics.availabilityStatus.find((s) => s.name === "Available")
                  ?.value /
                  (data?.length || 1)) *
                100
              ).toFixed(0)}
              % of employees are currently available
            </List.Item>
            <List.Item>
              <List.Indicator as={CheckCircle} color="green.500" />
              {(
                (metrics.availabilityStatus.find((s) => s.name === "On Leave")
                  ?.value /
                  (data?.length || 1)) *
                100
              ).toFixed(0)}
              % are on leave
            </List.Item>
            <List.Item>
              <List.Indicator as={CheckCircle} color="green.500" />
              {(
                (metrics.availabilityStatus.find(
                  (s) => s.name === "Not Available"
                )?.value /
                  (data?.length || 1)) *
                100
              ).toFixed(0)}
              % are not available
            </List.Item>
          </List.Root>
        </Box>
      </Grid>
    </Box>
  );
};

// Default props and export
WorkforceAnalytics.defaultProps = {
  data: [],
};

export default WorkforceAnalytics;
