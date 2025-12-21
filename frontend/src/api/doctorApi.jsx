import { http } from "./http";

export const doctorApi = {
  // --- appointments (если уже есть) ---
  listAppointments: async (params = {}) => (await http.get("/doctor/appointments/", { params })).data,
  getAppointment: async (id) => (await http.get(`/doctor/appointments/${id}/`)).data,
  setStatus: async (id, status) => (await http.post(`/doctor/appointments/${id}/set_status/`, { status })).data,

  // --- visit notes ---
  listVisitNotes: async (params = {}) => (await http.get("/doctor/visit-notes/", { params })).data,
  getVisitNote: async (id) => (await http.get(`/doctor/visit-notes/${id}/`)).data,
  createVisitNote: async (payload) => (await http.post("/doctor/visit-notes/", payload)).data,
  patchVisitNote: async (id, payload) => (await http.patch(`/doctor/visit-notes/${id}/`, payload)).data,
  deleteVisitNote: async (id) => (await http.delete(`/doctor/visit-notes/${id}/`)).data,

  // --- attachments ---
  listAttachments: async (noteId) =>
    (await http.get(`/doctor/visit-notes/${noteId}/attachments/`)).data,

  uploadAttachment: async (noteId, file) => {
    const form = new FormData();
    form.append("file", file); // если бэк ждёт другое имя — поменяй здесь
    return (await http.post(`/doctor/visit-notes/${noteId}/attachments/`, form)).data;
  },

  deleteAttachment: async (noteId, attachmentId) =>
    (await http.delete(`/doctor/visit-notes/${noteId}/attachments/${attachmentId}/`)).data,

  findVisitNoteByAppointment: async (appointmentId) => {
    const data = await http.get("/doctor/visit-notes/", {
      params: { appointment: appointmentId, page_size: 1 },
    });
    const res = data.data;
    const items = res?.results ?? res;
    return items?.[0] ?? null;
  },
  
  listPatients: async (params = {}) =>
  (await http.get("/doctor/patients/", { params })).data,

    getPatient: async (id) =>
    (await http.get(`/doctor/patients/${id}/`)).data,

    getPatientHistory: async (id) =>
    (await http.get(`/doctor/patients/${id}/history/`)).data,

    listSchedule: async (params = {}) =>
  (await http.get("/doctor/schedule/", { params })).data,

createSchedule: async (payload) =>
  (await http.post("/doctor/schedule/", payload)).data,

patchSchedule: async (id, payload) =>
  (await http.patch(`/doctor/schedule/${id}/`, payload)).data,

deleteSchedule: async (id) =>
  (await http.delete(`/doctor/schedule/${id}/`)).data,
listTimeOff: async (params = {}) =>
  (await http.get("/doctor/time-off/", { params })).data,

createTimeOff: async (payload) =>
  (await http.post("/doctor/time-off/", payload)).data,

patchTimeOff: async (id, payload) =>
  (await http.patch(`/doctor/time-off/${id}/`, payload)).data,

deleteTimeOff: async (id) =>
  (await http.delete(`/doctor/time-off/${id}/`)).data,

};
