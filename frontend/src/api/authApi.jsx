import { http } from "./http";

export const authApi = {
  login: async ({ email, password }) => {
    const { data } = await http.post("/auth/login/", { email, password });
    return data; 
  },

  logout: async ({ refresh }) => {
    const { data } = await http.post("/auth/logout/", { refresh });
    return data; 
  },
};
