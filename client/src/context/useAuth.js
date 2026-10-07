import { useContext } from "react";

import { AuthContext } from "./authContextInstance.js";

export function useAuth() {
  return useContext(AuthContext);
}
