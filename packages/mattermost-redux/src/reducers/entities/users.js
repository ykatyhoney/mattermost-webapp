// Copyright (c) 2016 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';
import {UserTypes} from 'action_types';
import {profileListToMap} from 'utils/user_utils';

function profilesToSet(state, action) {
    const id = action.id;
    const nextSet = new Set(state[id]);
    Object.keys(action.data).forEach((key) => {
        nextSet.add(key);
    });

    return {
        ...state,
        [id]: nextSet
    };
}

function profileListToSet(state, action) {
    const id = action.id;
    const nextSet = new Set(state[id]);
    action.data.forEach((profile) => {
        nextSet.add(profile.id);
    });

    return {
        ...state,
        [id]: nextSet
    };
}

function addProfileToSet(state, action) {
    const id = action.id;
    const nextSet = new Set(state[id]);
    nextSet.add(action.data.user_id);
    return {
        ...state,
        [id]: nextSet
    };
}

function removeProfileFromSet(state, action) {
    const id = action.id;
    const nextSet = new Set(state[id]);
    nextSet.delete(action.data.user_id);
    return {
        ...state,
        [id]: nextSet
    };
}

function currentUserId(state = '', action) {
    switch (action.type) {
    case UserTypes.RECEIVED_ME:
        return action.data.id;

    case UserTypes.LOGOUT_SUCCESS:
        return '';

    }

    return state;
}

function mySessions(state = [], action) {
    switch (action.type) {
    case UserTypes.RECEIVED_SESSIONS:
        return [...action.data];

    case UserTypes.RECEIVED_REVOKED_SESSION: {
        let index = -1;
        const length = state.length;
        for (let i = 0; i < length; i++) {
            if (state[i].id === action.sessionId) {
                index = i;
                break;
            }
        }
        if (index > -1) {
            return state.slice(0, index).concat(state.slice(index + 1));
        }

        return state;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return [];

    default:
        return state;
    }
}

function myAudits(state = [], action) {
    switch (action.type) {
    case UserTypes.RECEIVED_AUDITS:
        return [...action.data];

    case UserTypes.LOGOUT_SUCCESS:
        return [];

    default:
        return state;
    }
}

function profiles(state = {}, action) {
    switch (action.type) {
    case UserTypes.RECEIVED_ME: {
        return {
            ...state,
            [action.data.id]: {...action.data}
        };
    }
    case UserTypes.RECEIVED_PROFILES_LIST:
        return Object.assign({}, state, profileListToMap(action.data));
    case UserTypes.RECEIVED_PROFILES:
        return Object.assign({}, state, action.data);

    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function profilesInTeam(state = {}, action) {
    switch (action.type) {
    case UserTypes.RECEIVED_PROFILES_LIST_IN_TEAM:
        return profileListToSet(state, action);

    case UserTypes.RECEIVED_PROFILES_IN_TEAM:
        return profilesToSet(state, action);

    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function profilesInChannel(state = {}, action) {
    switch (action.type) {
    case UserTypes.RECEIVED_PROFILE_IN_CHANNEL:
        return addProfileToSet(state, action);

    case UserTypes.RECEIVED_PROFILES_LIST_IN_CHANNEL:
        return profileListToSet(state, action);

    case UserTypes.RECEIVED_PROFILES_IN_CHANNEL:
        return profilesToSet(state, action);

    case UserTypes.RECEIVED_PROFILE_NOT_IN_CHANNEL:
        return removeProfileFromSet(state, action);

    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function profilesNotInChannel(state = {}, action) {
    switch (action.type) {
    case UserTypes.RECEIVED_PROFILE_NOT_IN_CHANNEL:
        return addProfileToSet(state, action);

    case UserTypes.RECEIVED_PROFILES_LIST_NOT_IN_CHANNEL:
        return profileListToSet(state, action);

    case UserTypes.RECEIVED_PROFILES_NOT_IN_CHANNEL:
        return profilesToSet(state, action);

    case UserTypes.RECEIVED_PROFILE_IN_CHANNEL:
        return removeProfileFromSet(state, action);

    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function statuses(state = {}, action) {
    switch (action.type) {
    case UserTypes.RECEIVED_STATUSES: {
        return Object.assign({}, state, action.data);
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function autocompleteUsersInChannel(state = {}, action) {
    switch (action.type) {
    case UserTypes.RECEIVED_AUTOCOMPLETE_IN_CHANNEL:
        return Object.assign({}, state, {[action.channelId]: action.data});
    default:
        return state;
    }
}

function search(state = {}, action) {
    switch (action.type) {
    case UserTypes.RECEIVED_SEARCH_PROFILES:
        return action.data;

    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

export default combineReducers({

    // the current selected user
    currentUserId,

    // array with the user's sessions
    mySessions,

    // array with the user's audits
    myAudits,

    // object where every key is a user id and has an object with the users details
    profiles,

    // object where every key is a team id and has a Set with the users id that are members of the team
    profilesInTeam,

    // object where every key is a channel id and has a Set with the users id that are members of the channel
    profilesInChannel,

    // object where every key is a channel id and has a Set with the users id that are members of the channel
    profilesNotInChannel,

    // object where every key is the user id and has a value with the current status of each user
    statuses,

    // object where every key is a channel id and has a [channelId] object that contains members that are in and out of the current channel
    autocompleteUsersInChannel,

    // object where every key is a user id and has an object with the users details
    search
});
