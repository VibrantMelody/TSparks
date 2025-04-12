import { useState, useEffect, useRef, useCallback } from "react";
import {
  Container,
  Button,
  Text,
  HStack,
  VStack,
  Stack,
  Grid,
  Input,
  CheckboxCard,
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogBody,
} from "@chakra-ui/react";
import { LuFileText } from "react-icons/lu";
import { Square, Trash2 } from "lucide-react";
import { getDocsFromDb, addDocsToDb, deleteDocFromDb } from "../firebase";
import { toaster } from "../components/ui/toaster";
import { InputGroup } from "../components/ui/input-group";

export default function Messages({ activeUserName }) {
  const [allMessages, setAllMessages] = useState(undefined);
  const [users, setUsers] = useState(undefined);
  const [userToMessage, setUserToMessage] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messageRef = useRef(null);
  const [dialog, setDialog] = useState({
    isOpen: false,
    message: "",
  });
  const [sendDialog, setSendDialog] = useState(false);

  const refreshMessages = useCallback(() => {
    Promise.all([getDocsFromDb("Users"), getDocsFromDb("Messages")])
      .then(([users, messages]) => {
        const filteredMessages = messages.filter(
          (message) =>
            message.Sender === activeUserName ||
            message.Receiver.includes(activeUserName)
        );
        setAllMessages(filteredMessages);
        setUsers(users);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
        toaster.create({
          description: "Error loading messages",
          type: "error",
        });
      });
  }, [activeUserName]);

  useEffect(() => {
    refreshMessages();
  }, [refreshMessages]);

  function handleUserCheckChanged(isChecked, user) {
    setUserToMessage((prev) =>
      isChecked ? [...prev, user] : prev.filter((u) => u !== user)
    );
  }

  async function handleMessageSend(message) {
    if (!message?.trim() || userToMessage.length === 0) {
      setDialog({
        isOpen: true,
        message: "Please select recipients and enter a message",
      });
      return;
    }

    setIsLoading(true);
    try {
      const newMessage = {
        Sender: activeUserName,
        Receiver: userToMessage,
        Message: message.trim(),
      };

      const messageRef = await addDocsToDb("Messages", newMessage);

      if (messageRef) {
        setAllMessages((prev) => [
          ...prev,
          { ...newMessage, id: messageRef.id },
        ]);
        setSendDialog(false);
        // messageRef.current.value = "";
        setUserToMessage([]);
        toaster.create({
          description: "Message sent successfully",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toaster.create({
        description: "Failed to send message",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMessageDelete(message) {
    try {
      await deleteDocFromDb("Messages", message.id);
      setAllMessages((prev) => prev.filter((msg) => msg.id !== message.id));
      toaster.create({
        description: "Message deleted successfully",
        type: "success",
      });
    } catch (err) {
      console.error("Error deleting message:", err);
      toaster.create({
        description: "Couldn't delete message",
        type: "error",
      });
    }
  }

  if (!allMessages || !users) {
    return (
      <Container centerContent>
        <Text fontSize="lg">Loading messages...</Text>
      </Container>
    );
  }

  const usersList = users.map((user) => user.Name);

  return (
    <Container height="100%" width="100%">
      {/* Send Message Dialog */}
      <DialogRoot open={sendDialog} onOpenChange={setSendDialog}>
        <DialogTrigger asChild>
          <Button colorScheme="blue" leftIcon={<Square />}>
            Send Message
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Stack spacing={4}>
              <Grid templateColumns="repeat(4, 1fr)" gap="1rem">
                {usersList.map((user) => (
                  <CheckboxCard.Root
                    key={user}
                    onCheckedChange={(isChecked) =>
                      handleUserCheckChanged(isChecked, user)
                    }
                  >
                    <CheckboxCard.HiddenInput />
                    <CheckboxCard.Control>
                      <CheckboxCard.Label>{user}</CheckboxCard.Label>
                    </CheckboxCard.Control>
                  </CheckboxCard.Root>
                ))}
              </Grid>
              <InputGroup startElement={<LuFileText />}>
                <Input placeholder="Type your message" ref={messageRef} />
              </InputGroup>
            </Stack>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleMessageSend(messageRef.current?.value)}
              isLoading={isLoading}
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Status Dialog */}
      <DialogRoot
        open={dialog.isOpen}
        onOpenChange={(open) =>
          setDialog((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notice</DialogTitle>
          </DialogHeader>
          <DialogBody>{dialog.message}</DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialog({ isOpen: false, message: "" })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Messages List */}
      <Container width="100%" marginTop="5rem" padding="1rem">
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Conversations
        </Text>
        <VStack spacing={4} align="stretch">
          {allMessages.map((message, index) => (
            <HStack
              key={index}
              p={4}
              boxShadow="md"
              borderRadius="lg"
              justifyContent="space-between"
              backgroundColor="whiteAlpha.50"
            >
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">From: {message.Sender}</Text>
                <Text fontWeight="bold">To: {message.Receiver.join(", ")}</Text>
                <Text>{message.Message}</Text>
              </VStack>
              <Button
                colorScheme="red"
                variant="ghost"
                onClick={() => handleMessageDelete(message)}
              >
                <Trash2 />
              </Button>
            </HStack>
          ))}
        </VStack>
      </Container>
    </Container>
  );
}
