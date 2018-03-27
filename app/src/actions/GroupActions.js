import uuidv4 from 'uuid/v4';
import _ from 'lodash';
import {
  GROUP_ADD_REQUEST,
  GROUP_ADD_SUCCESS,
  GROUP_ADD_ERROR,
  GROUP_ADD_RESET,

  GROUP_FETCH_REQUEST,
  GROUP_FETCH_SUCCESS,
  GROUP_FETCH_ERROR,
  GROUP_FETCH_RESET,

  GROUP_GROUP_ADD_REQUEST,
  GROUP_GROUP_ADD_SUCCESS,
  GROUP_GROUP_ADD_ERROR,
  GROUP_GROUP_ADD_RESET,

  GROUP_REMOVE_TAG_REQUEST,
  GROUP_REMOVE_TAG_SUCCESS,
  GROUP_REMOVE_TAG_ERROR,
  GROUP_REMOVE_TAG_RESET,

  GROUP_REMOVE_GROUP_REQUEST,
  GROUP_REMOVE_GROUP_SUCCESS,
  GROUP_REMOVE_GROUP_ERROR,
  GROUP_REMOVE_GROUP_RESET,

} from '../types/GroupTypes';

import { AUTH_ERROR } from '../types/AuthTypes';
import { OFFLINE_QUEUE } from '../types/OfflineTypes';
import ApiRequest from '../services/ApiRequest';
import { fakePromise } from '../services/Common';

// add addTagsGroupToMyActivity action
export const addTagsGroupToMyActivity = (activity, tags) => (
  async (dispatch, getState) => {
    try {
      dispatch({
        type: GROUP_ADD_REQUEST,
      });

      const activityId = activity.id;
      const groupId = uuidv4();
      const myactivity = {
        byActivityId: {
          [activityId]: {
            byGroupId: {
              [groupId]: tags,
            },
            allGroupIds: [groupId]
          }
        },
        allActivityIds: [activityId]
      };

      const group = {
        groupId,
        activityId,
        tags,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const { isConnected } = getState().network;
      const apiUrl = '/api/private/group';
      const payload = {
        UID: uuidv4(),
        data: group,
        apiUrl,
        method: 'post',
      };

      if (isConnected) {
        //TODO: Make api call if network available, otherwise store in activity queue
        await ApiRequest(payload);
        //const { data } = response;
      } else {
        dispatch({
          type: OFFLINE_QUEUE,
          payload
        });
        await fakePromise(300);
      }
      dispatch({
        type: GROUP_ADD_SUCCESS,
        payload: myactivity
      });
    } catch (error) {
      console.log('addTagsGroupToMyActivity', error);
      if (!_.isUndefined(error.response) && error.response.status === 401) {
        dispatch({
          type: AUTH_ERROR,
          payload: error.response
        });
      } else {
        dispatch({
          type: GROUP_ADD_ERROR,
          payload: error.response
        });
      }
    }
    dispatch({
      type: GROUP_ADD_RESET,
    });
  }
);


export const getMyActivities = () => (
  async (dispatch, getState) => {
    let myactivities = {
      byActivityId: {},
      allActivityIds: []
    };

    try {
      const { isConnected } = getState().network;
      if (isConnected) {
        dispatch({
          type: GROUP_FETCH_REQUEST
        });

        const payload = {
          data: null,
          apiUrl: '/api/private/group',
          method: 'get'
        };

        //if (isConnected) {
          const response = await ApiRequest(payload);
          //console.log('responseGetMyActivities:');
          console.log(response);
          const { data } = response;
          myactivities = data;
        //}

        dispatch({
          type: GROUP_FETCH_SUCCESS,
          payload: data,
          isOnline: isConnected
        });
      }
    } catch (error) {
      if (!_.isUndefined(error.response) && error.response.status === 401) {
        dispatch({
          type: AUTH_ERROR,
          payload: error.response
        });
      } else {
        dispatch({
          type: GROUP_FETCH_ERROR,
          payload: error.response
        });
      }
    }
    await fakePromise(100);
    dispatch({
      type: GROUP_FETCH_RESET
    });
  }
);

export const useThisGroupForActivity = (activityId, groupId) => (
  async (dispatch, getState) => {
    try {
      dispatch({
        type: GROUP_GROUP_ADD_REQUEST,
      });

      const { isConnected } = getState().network;
      const apiUrl = '/api/private/group';
      const payload = {
        UID: uuidv4(),
        data: { groupId, updatedAt: Date.now() },
        apiUrl,
        method: 'put',
      };
      if (isConnected) {
        //TODO: Make api call if network available, otherwise store in activity queue
        await ApiRequest(payload);
        //const { data } = response;
      } else {
        dispatch({
          type: OFFLINE_QUEUE,
          payload
        });
        await fakePromise(300);
      }

      const data = {
        activityId,
        groupId
      };
      dispatch({
        type: GROUP_GROUP_ADD_SUCCESS,
        payload: data
      });
    } catch (error) {
      if (!_.isUndefined(error.response) && error.response.status === 401) {
        dispatch({
          type: AUTH_ERROR,
          payload: error.response
        });
      } else {
        dispatch({
          type: GROUP_GROUP_ADD_ERROR,
          payload: error.response
        });
      }
    }
    dispatch({
      type: GROUP_GROUP_ADD_RESET,
    });
  }
);


export const removeTagFromGroup = (activityId, groupId, tagId) => (
  async (dispatch, getState) => {
    try {
      dispatch({
        type: GROUP_REMOVE_TAG_REQUEST,
      });
      const { isConnected } = getState().network;

      const apiUrl = `/api/private/group/${groupId}/${tagId}`;
      const payload = {
        UID: uuidv4(),
        data: null,
        apiUrl,
        method: 'delete',
      };

      if (isConnected) {
        await ApiRequest(payload);
      } else {
        dispatch({
          type: OFFLINE_QUEUE,
          payload
        });
        await fakePromise(100);
      }

      dispatch({
        type: GROUP_REMOVE_TAG_SUCCESS,
        payload: {
          activityId,
          groupId,
          tagId
        }
      });
    } catch (error) {
      if (!_.isUndefined(error.response) && error.response.status === 401) {
        dispatch({
          type: AUTH_ERROR,
          payload: error.response
        });
      } else {
        dispatch({
          type: GROUP_REMOVE_TAG_ERROR,
          payload: error.response
        });
      }
    }
    dispatch({
      type: GROUP_REMOVE_TAG_RESET,
    });
  }
);

//removeGroupFromActivity
export const removeGroupFromActivity = (activityId, groupId) => (
  async (dispatch, getState) => {
    try {
      dispatch({
        type: GROUP_REMOVE_GROUP_REQUEST,
      });
      const { isConnected } = getState().network;

      const apiUrl = `/api/private/group/${groupId}`;
      const payload = {
        UID: uuidv4(),
        data: null,
        apiUrl,
        method: 'delete',
      };

      if (isConnected) {
        await ApiRequest(payload);
      } else {
        dispatch({
          type: OFFLINE_QUEUE,
          payload
        });
        await fakePromise(100);
      }

      dispatch({
        type: GROUP_REMOVE_GROUP_SUCCESS,
        payload: {
          activityId,
          groupId,
        }
      });
    } catch (error) {
      if (!_.isUndefined(error.response) && error.response.status === 401) {
        dispatch({
          type: AUTH_ERROR,
          payload: error.response
        });
      } else {
        dispatch({
          type: GROUP_REMOVE_GROUP_ERROR,
          payload: error.response
        });
      }
    }
    dispatch({
      type: GROUP_REMOVE_GROUP_RESET,
    });
  }
);