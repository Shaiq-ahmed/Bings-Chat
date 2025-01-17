import { axiosInstance } from "../lib/axios";

export const chatLoader = async ({ params }) => {
  const { chatId } = params;
  console.log(params)
  try {
    const [chatDetailsRes, initialMessagesRes] = await Promise.all([
      axiosInstance.get(`/chat/details/${chatId}`),
      axiosInstance.get(`/messages/${chatId}?offset=0&limit=20`)
    ]);

    return { 
      chatDetails: chatDetailsRes.data.chat,
      initialMessages: initialMessagesRes.data.messages.reverse(),
      hasMoreMessages: initialMessagesRes.data.messages.length === 20
    };
  } catch (error) {
    console.error("Error loading chat data:", error);
    throw error;
  }
};