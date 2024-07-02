// src/redux/actions/authActions.js
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';

export const rgcLogin = (token) => ({
  type: LOGIN_SUCCESS,
  payload: token
});

export const loginFailure = (error) => ({
  type: LOGIN_FAILURE,
  payload: error
});

export const logout = () => {
  localStorage.removeItem('token');
  return { type: LOGOUT };
};