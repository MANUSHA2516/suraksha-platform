import { createContext, useContext } from 'react';
import type { SafeUser } from '@suraksha/types';
export const SessionContext = createContext<{
  user: SafeUser | null;
  setUser: (u: SafeUser | null) => void;
  locked: boolean;
  setLocked: (v: boolean) => void;
  nic: string;
  setNic: (v: string) => void;
}>({ user: null, setUser: () => {}, locked: true, setLocked: () => {}, nic: '', setNic: () => {} });
export const useSession = () => useContext(SessionContext);
export type ScreenProps = { navigation: any; route: { name: string; params?: any } };
