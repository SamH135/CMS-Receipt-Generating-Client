// src/redux/reducers/authReducer.js
import { LOGIN_SUCCESS, LOGOUT, SET_RGC_USERNAME, SET_SELECTED_CLIENT } from '../actions/authActions';

const initialState = {
  token: localStorage.getItem('rgcToken'),
  rgcUsername: localStorage.getItem('rgcUsername') || '',
  isAuthenticated: !!localStorage.getItem('rgcToken'),
  selectedClient: null
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      localStorage.setItem('rgcToken', action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case LOGOUT:
      localStorage.removeItem('rgcToken');
      localStorage.removeItem('rgcUsername');
      return {
        ...state,
        token: null,
        rgcUsername: '',
        isAuthenticated: false,
      };
    case SET_RGC_USERNAME:
      localStorage.setItem('rgcUsername', action.payload);
      return {
        ...state,
        rgcUsername: action.payload,
      };
    case SET_SELECTED_CLIENT:
      return {
        ...state,
        selectedClient: action.payload,
      };
    default:
      return state;
  }
};

export default authReducer;
