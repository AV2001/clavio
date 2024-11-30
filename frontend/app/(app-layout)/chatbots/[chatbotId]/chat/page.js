import { getChatbot } from "@/app/_api/chatbotApi";
import Heading from "@/app/_components/Heading";
import ChatInterface from "./ChatInterface";

export const metadata = {
  title: "Chat",
};

export default async function ChatbotChatPage({ params }) {
  const chatbot = await getChatbot(params.chatbotId);

  return (
    <>
      <Heading>
        {chatbot.name
          ? chatbot.name
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
          : ""}
      </Heading>
      <div className="mt-8 h-[calc(100vh-theme(spacing.48))] flex flex-col bg-white rounded-lg border shadow-sm overflow-hidden">
        <ChatInterface chatbot={chatbot} />
      </div>
    </>
  );
}
