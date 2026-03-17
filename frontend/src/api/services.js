import client from "./axiosClient";

export const authService = {
  login: (email, password) => client.post("/login", { email, password }),
};

export const teacherService = {
  // CORREGIDO: Cambiado de /teachers/ a /teacher/ para coincidir con routes.js
  getMyGroups: (teacherId) => client.get(`/teacher/${teacherId}/groups`),

  // CORREGIDO: Usando 'client.get' en lugar de 'axios.get'. 
  // Eliminamos el header manual porque 'client' (axiosClient) ya debe encargarse de inyectar el token.
  getGroupStudents: (groupId, subjectId) => client.get(`/teacher/group/${groupId}/students`, {
    params: { subjectId }
  }),

  // CORREGIDO: Cambiado de /teachers/grades a /teacher/grade para coincidir con routes.js
  updateGrade: (data) => client.post("/teacher/grade", data),
};

export const studentService = {
  // CORREGIDO: Cambiado de /students/ a /student/ para coincidir con routes.js
  getHistory: (studentId) => client.get(`/student/${studentId}/history`),
};

// INTACTO: Tal cual como lo tenías
export const adminService = {
  getTeachers: () => client.get("/admin/teachers"),
  getSubjects: () => client.get("/admin/subjects"),
  createGroup: (data) => client.post("/admin/groups", data),
  createUser: (data) => client.post("/admin/users", data),
  getStats: () => client.get('/admin/stats'),
};