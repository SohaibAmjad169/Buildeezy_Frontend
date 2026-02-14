import { configureStore } from "@reduxjs/toolkit";
import configReducer from "./redux/configSlice";
import registerReducer from "./redux/registerSlice";
import onboardingReducer from "./redux/onboardingSlice";
import profileReducer from "./redux/profileSlice";
import adReducer from "./redux/adSlice";
import jobReducer from "./redux/jobSlice";
import bidReducer from "./redux/bidSlice";
import notificationsReducer from "./redux/notificationsSlice";
import milestoneReducer from "./redux/milestoneSlice";
import pubnubReducer from "./redux/pubnubSlice";
import userManagementReducer from "./redux/userManagementSlice";
import webinarReducer from "./redux/webinarSlice";
import userSettingsReducer from "./redux/userSettingsSlice";

export const store = configureStore({
  reducer: {
    config: configReducer,
    register: registerReducer,
    onboarding: onboardingReducer,
    profile: profileReducer,
    ad: adReducer,
    job: jobReducer,
    bid: bidReducer,
    notifications: notificationsReducer,
    milestone: milestoneReducer,
    pubnub: pubnubReducer,
    userManagement: userManagementReducer,
    webinar: webinarReducer,
    userSettings: userSettingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
