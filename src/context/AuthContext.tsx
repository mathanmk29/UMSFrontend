/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext } from "react";
import { LoginRequest, LoginResponse, SignupRequest } from "types";

interface AuthContextType {
  authProfile: LoginResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (loginData : LoginRequest) => Promise<void>;
  signUp: (signupData : SignupRequest) => Promise<void>;
  signOut: () => Promise<void>;
  facultySignUp: (signupData : SignupRequest) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

