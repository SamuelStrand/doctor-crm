import { http } from "./http";

export const adminApi = {
  // --- DOCTORS ---
  listDoctors: async (params = {}) => (await http.get("/admin/doctors/", { params })).data,
  createDoctor: async (payload) => (await http.post("/admin/doctors/", payload)).data,
  patchDoctor: async (id, payload) => (await http.patch(`/admin/doctors/${id}/`, payload)).data,
  deleteDoctor: async (id) => (await http.delete(`/admin/doctors/${id}/`)).data,

  // --- PATIENTS ---
  listPatients: async (params = {}) => (await http.get("/admin/patients/", { params })).data,
  createPatient: async (payload) => (await http.post("/admin/patients/", payload)).data,
  patchPatient: async (id, payload) => (await http.patch(`/admin/patients/${id}/`, payload)).data,
  deletePatient: async (id) => (await http.delete(`/admin/patients/${id}/`)).data,

  // --- SERVICES ---
  listServices: async (params = {}) => (await http.get("/admin/services/", { params })).data,
  createService: async (payload) => (await http.post("/admin/services/", payload)).data,
  patchService: async (id, payload) => (await http.patch(`/admin/services/${id}/`, payload)).data,
  deleteService: async (id) => (await http.delete(`/admin/services/${id}/`)).data,

  // --- ROOMS ---
  listRooms: async (params = {}) => (await http.get("/admin/rooms/", { params })).data,
  createRoom: async (payload) => (await http.post("/admin/rooms/", payload)).data,
  patchRoom: async (id, payload) => (await http.patch(`/admin/rooms/${id}/`, payload)).data,
  deleteRoom: async (id) => (await http.delete(`/admin/rooms/${id}/`)).data,

  // --- APPOINTMENTS ---
  listAppointments: async (params = {}) => (await http.get("/admin/appointments/", { params })).data,
  createAppointment: async (payload) => (await http.post("/admin/appointments/", payload)).data,
  getAppointment: async (id) => (await http.get(`/admin/appointments/${id}/`)).data,
  patchAppointment: async (id, payload) => (await http.patch(`/admin/appointments/${id}/`, payload)).data,
  deleteAppointment: async (id) => (await http.delete(`/admin/appointments/${id}/`)).data,

};
