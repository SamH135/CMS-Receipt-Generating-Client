// src/redux/actions/authActions.js
import axiosInstance from '../../axiosInstance';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';
export const SET_RGC_USERNAME = 'SET_RGC_USERNAME';


export const loginSuccess = (token) => ({
  type: LOGIN_SUCCESS,
  payload: { token }
});

export const loginFailure = (error) => ({
  type: LOGIN_FAILURE,
  payload: error
});

export const logout = () => {
  localStorage.removeItem('rgcToken');
  localStorage.removeItem('rgcUsername');
  return { type: LOGOUT };
};

export const setRGCUsername = (username) => ({
  type: SET_RGC_USERNAME,
  payload: username,
});

// Thunk action creator for RGC login
export const rgcLogin = (passcode) => async (dispatch) => {
  try {
    const response = await axiosInstance.post('/api/rgc/login', { passcode });
    if (response.data.token) {
      dispatch(loginSuccess(response.data.token));
      return true;
    }
  } catch (error) {
    dispatch(loginFailure(error.response?.data?.message || 'Login failed'));
    return false;
  }
};