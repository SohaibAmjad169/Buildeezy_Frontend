import PubNub from "pubnub";
import { setPubNubInstance } from "../../redux/pubnubSlice";

// Function to initialize and return a PubNub instance
export const initPubNub = (userUUID, dispatch) => {
  // Ensure userUUID is a string
  const uuid = String(userUUID).trim();

  const pubnub = new PubNub({
    publishKey: import.meta.env.VITE_PUBNUB_PUB_KEY,
    subscribeKey: import.meta.env.VITE_PUBNUB_SUB_KEY,
    uuid: uuid,
    authKey: uuid,    
  });

  if (typeof Notification !== "undefined") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        // Permission granted
      } else {
        console.error("Notification permission denied");
      }
    });
  } else {
    console.warn("Notification API not available on this browser.");
  }

  dispatch(setPubNubInstance(pubnub));
  return pubnub;
};
