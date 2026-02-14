// Create a new file: hooks/useOnlineStatus.js

import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setUserOnlineStatus,
  updateMultipleUsersOnlineStatus,
  addPresenceChannel
} from '../redux/pubnubSlice';

export const useOnlineStatus = () => {
  const dispatch = useDispatch();
  const { pubnubInstance, userList, onlineUsers } = useSelector(state => state.pubnub);
  const { profileData } = useSelector(state => state.profile);

  // Set up presence listeners
  const setupPresenceListeners = useCallback(() => {
    if (!pubnubInstance) return;

    const presenceListener = {
      presence: (presenceEvent) => {
        const { action, uuid, channel, timestamp } = presenceEvent;
        
        console.log('Presence event:', { action, uuid, channel, timestamp });
        
        // Update user online status based on presence events
        if (uuid && uuid !== profileData.id) {
          const isOnline = action === 'join' || action === 'state-change';
          const isOffline = action === 'leave' || action === 'timeout';
          
          if (isOnline || isOffline) {
            dispatch(setUserOnlineStatus({
              userId: uuid,
              isOnline: isOnline,
              lastSeen: timestamp * 10000 // Convert to milliseconds
            }));
          }
        }
      }
    };

    pubnubInstance.addListener(presenceListener);

    return () => {
      pubnubInstance.removeListener(presenceListener);
    };
  }, [pubnubInstance, profileData.id, dispatch]);

  // Get online status for all users
  const checkAllUsersOnlineStatus = useCallback(async () => {
    if (!pubnubInstance || !userList.length) return;

    try {
      // Create presence channels for all users
      const presenceChannels = userList.map(user => `presence-${user.id}`);
      
      // Subscribe to presence channels
      await pubnubInstance.subscribe({
        channels: presenceChannels,
        withPresence: true
      });

      // Mark presence channels as subscribed
      presenceChannels.forEach(channel => {
        dispatch(addPresenceChannel({ channelId: channel }));
      });

      // Get current presence for all users
      const hereNowResponse = await new Promise((resolve, reject) => {
        pubnubInstance.hereNow({
          channels: presenceChannels,
          includeUUIDs: true,
          includeState: false
        }, (status, response) => {
          if (status.error) {
            reject(status);
          } else {
            resolve(response);
          }
        });
      });

      // Process the response to update online status
      const usersStatus = {};
      
      userList.forEach(user => {
        const presenceChannel = `presence-${user.id}`;
        const channelInfo = hereNowResponse.channels[presenceChannel];
        
        if (channelInfo) {
          const isUserOnline = channelInfo.occupants.some(occupant => 
            occupant.uuid === user.id
          );
          
          usersStatus[user.id] = {
            isOnline: isUserOnline,
            lastSeen: isUserOnline ? new Date().getTime() : (onlineUsers[user.id]?.lastSeen || 0)
          };
        } else {
          usersStatus[user.id] = {
            isOnline: false,
            lastSeen: onlineUsers[user.id]?.lastSeen || 0
          };
        }
      });

      dispatch(updateMultipleUsersOnlineStatus({ usersStatus }));
      
    } catch (error) {
      console.error('Error checking users online status:', error);
    }
  }, [pubnubInstance, userList, dispatch, onlineUsers]);

  // Alternative method: Check presence when messages are received
  const checkUserOnlineStatusOnMessage = useCallback((userId) => {
    if (!pubnubInstance || !userId) return;

    // When we receive a message, we know the user is online
    dispatch(setUserOnlineStatus({
      userId,
      isOnline: true,
      lastSeen: new Date().getTime()
    }));

    // Set up a timeout to check if user goes offline (optional)
    setTimeout(() => {
      pubnubInstance.hereNow({
        channels: [`presence-${userId}`],
        includeUUIDs: true
      }, (status, response) => {
        if (!status.error && response.channels[`presence-${userId}`]) {
          const isOnline = response.channels[`presence-${userId}`].occupants.some(
            occupant => occupant.uuid === userId
          );
          
          if (!isOnline) {
            dispatch(setUserOnlineStatus({
              userId,
              isOnline: false,
              lastSeen: new Date().getTime()
            }));
          }
        }
      });
    }, 30000); // Check after 30 seconds
  }, [pubnubInstance, dispatch]);

  // Set up listeners on mount
  useEffect(() => {
    const cleanup = setupPresenceListeners();
    return cleanup;
  }, [setupPresenceListeners]);

  // Check online status when userList changes
  useEffect(() => {
    if (userList.length > 0) {
      checkAllUsersOnlineStatus();
    }
  }, [userList, checkAllUsersOnlineStatus]);

  return {
    onlineUsers,
    checkUserOnlineStatusOnMessage,
    checkAllUsersOnlineStatus
  };
};