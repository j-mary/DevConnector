import { TEST_DISPATCH } from './types';

// Register User
export const RegisterUser = userData => {
  return {
    type: TEST_DISPATCH,
    payload: userData
  };
};
