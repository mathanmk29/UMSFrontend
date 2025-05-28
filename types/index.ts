export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';
 
export type LoginRequest = {
  email: string;
  password: string;
}

export type SignupRequest = {
  name: string;
  regNum: string;
  email: string;
  password: string;
}

export type AuthProfile = {
    id: string;
    regNum : string;
    name: string;
    email: string;
    role: UserRole;
    contact:string;
};

export type LoginResponse = {
  token: string;
  refresh_token: string;
  profile: AuthProfile;
}
