import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { StreamChat } from "stream-chat";
import { Streami18n } from "stream-chat-react";
import axios from "axios";
import { getLocalStorage } from "../../../utils/localStorageUtils";
import { USER_DATA } from "../../../utils/constants/auth";
import { getStreamToken } from "../../../apis/apiEndPoints";

let videoClient;
let chatClient;

const { user } = JSON.parse(getLocalStorage(USER_DATA) || "{}");

export const getStreamClient = async (language = "en") => {
  const userId = String(user?.id);
  if (!userId) throw new Error("userId is missing or invalid");

  const apiKey = "2bgqy398rpnd";
  // const apiKey = "hfxsp3tqm9vu";

  // const response = await axios.post("http://localhost:5000/get-token", { userId });
  const response = await getStreamToken(userId)
  const token = response.data.token;

  const fullName = `${user.firstName} ${user.lastName}`;

  // Create i18n instance
  const i18nInstance = new Streami18n({ language });
  await i18nInstance.getTranslators();

  if (!videoClient) {
    videoClient = new StreamVideoClient({ apiKey });
    await videoClient.connectUser({ id: userId, name: fullName, image: user.avatar }, token);
  }

  if (!chatClient) {
    chatClient = StreamChat.getInstance(apiKey);
    await chatClient.connectUser({ id: userId, name: fullName, image: user.avatar }, token);
  }

  return { videoClient, chatClient, i18nInstance };
};
