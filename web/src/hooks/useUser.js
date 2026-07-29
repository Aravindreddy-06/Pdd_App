import { useContext } from 'react';
import { UserContext } from '../context/UserContextInstance';

export function useUser() {
  return useContext(UserContext);
}
