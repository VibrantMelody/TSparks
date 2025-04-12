import { Flex, HStack, Image, Text } from "@chakra-ui/react";
import logo from "../assets/logo.png";

function Sidebar({ sidebarOptions, selectedOption, setSelectedOption }) {
  return (
    <Flex
      direction="column"
      gap="1rem"
      justify="start"
      alignItems="center"
      height="100%"
      width="20%"
      color="fg.muted"
      fontSize="1.2rem"
    >
      <HStack>
        <Image transform="translateX(-30%)" justify="start" src={logo}></Image>
        <Text fontSize="1rem" fontWeight="bold">
          v1.0.1
        </Text>
      </HStack>
      <Text fontWeight="bold" alignSelf="normal" paddingLeft="1rem">
        General
      </Text>
      {Object.entries(sidebarOptions).map(([key, Icon]) => (
        <HStack
          _active={{ bg: "bg.emphasized" }}
          padding=".5rem 1.5rem"
          _hover={{ bg: "bg.emphasized" }}
          borderRadius="md"
          onClick={() => setSelectedOption(key)}
          cursor="button"
          width="90%"
          key={key}
          data-active={selectedOption === key ? "true" : undefined}
          color={selectedOption == key ? "fg" : "fg.muted"}
        >
          {Icon}
          <Text fontWeight="semibold">{key}</Text>
        </HStack>
      ))}
    </Flex>
  );
}

export default Sidebar;