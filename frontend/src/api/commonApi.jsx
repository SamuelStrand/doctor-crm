import { http } from "./http";

export const commonApi = {
  me: async () => {
    const { data } = await http.get("/me/");
    return data;
  },
};
