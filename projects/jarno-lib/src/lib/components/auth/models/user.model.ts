import { Role } from "./role.model";

export interface User {
  username: string;
  password: string;
  email: string;
  fullname?: string;
  roles: Role[];  // Can have multiple roles
}
