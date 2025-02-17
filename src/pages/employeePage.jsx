import { LiaTasksSolid } from "react-icons/lia";
import { PiBooksDuotone } from "react-icons/pi";
import { CgPerformance } from "react-icons/cg";
import { MdContactPage } from "react-icons/md";
import { TbConePlus } from "react-icons/tb";
import {
  Table,
  Flex,
  Container,
  Box,
  Text,
  Button,
  Icon,
} from "@chakra-ui/react";
import Sidebar from "../comps/sidebar";
import { useState } from "react";
import { CiBoxList } from "react-icons/ci";
import { RxShare2 } from "react-icons/rx";
import { taskData } from "../assets/fakedata";
import {
  LuCircleCheckBig,
  LuCircleDashed,
  LuCircleFadingArrowUp,
  LuCircleSlash,
} from "react-icons/lu";

function EmployeePage() {
  const [selectedOption, setSelectedOption] = useState("Tasks");
  const sidebarOptions = {
    Tasks: <LiaTasksSolid />,
    Learning: <PiBooksDuotone />,
    "View Performance": <CgPerformance />,
    "Apply Promotion": <TbConePlus />,
    Applications: <MdContactPage />,
  };

  return (
    <Flex height="100%" width="100%">
      <Sidebar sidebarOptions={sidebarOptions} selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
      <Box
        height="96%"
        width="79%"
        margin="auto"
        boxShadow="2xl"
        borderRadius="lg"
      >
        {selectedOption === "Tasks" && <Tasks />}
      </Box>
    </Flex>
  );

  function Tasks() {
    function progressIcons(status) {
      switch (status) {
        case "In Progress":
          return (
            <Icon fontSize="2xl" color="fg.info">
              <LuCircleFadingArrowUp />
            </Icon>
          );
        case "Not Started":
          return (
            <Icon fontSize="2xl" color="fg.error">
              <LuCircleSlash />
            </Icon>
          );
        case "Pending":
          return (
            <Icon fontSize="2xl" color="fg.warning">
              <LuCircleDashed />
            </Icon>
          );
        case "Completed":
          return (
            <Icon fontSize="2xl" color="fg.success">
              <LuCircleCheckBig />
            </Icon>
          );
      }
    }

    return (
      <Container height="100%" width="100%">
        <Flex direction="column" gap="1rem">
          <Flex bg="bg.emphasized" justify="space-around" alignItems="center">
            <Button variant="outline">Filter</Button>
            <Button variant="outline">
              <CiBoxList />
            </Button>
            <Button variant="outline">
              <RxShare2 />
            </Button>
          </Flex>
          <Table.Root striped fontSize="1.1rem">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Title</Table.ColumnHeader>
                <Table.ColumnHeader>Description</Table.ColumnHeader>
                <Table.ColumnHeader>Department</Table.ColumnHeader>
                <Table.ColumnHeader>Due Date</Table.ColumnHeader>
                <Table.ColumnHeader>Priority</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {taskData.map(
                ({
                  taskId,
                  title,
                  description,
                  dueDate,
                  priority,
                  status,
                  department,
                }) => (
                  <Table.Row>
                    <Table.Cell>
                      {progressIcons(status)} {status}{" "}
                    </Table.Cell>
                    <Table.Cell>{title}</Table.Cell>
                    <Table.Cell>{description}</Table.Cell>
                    <Table.Cell>{department}</Table.Cell>
                    <Table.Cell>{dueDate}</Table.Cell>
                    <Table.Cell>{priority}</Table.Cell>
                  </Table.Row>
                )
              )}
            </Table.Body>
          </Table.Root>
          <Text bg="bg.emphasized" padding=".5rem 1rem">
            21 Rows Remaining
          </Text>
        </Flex>
      </Container>
    );
  }
}

export default EmployeePage;
