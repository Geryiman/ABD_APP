import React, { useEffect, useState } from 'react';
import { teacherService } from '../../api/services';
import { Users, Save, ChevronLeft, UserCircle, Edit } from 'lucide-react'; // Agregamos Edit
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const teacherName = user?.name || user?.full_name || 'Profesor';

  useEffect(() => {
    const loadGroups = async () => {
      if (!user.id) return;
      try {
        const response = await teacherService.getMyGroups(user.id);
        const groupsData = response.data ? response.data : response;
        setGroups(Array.isArray(groupsData) ? groupsData : []);
      } catch (err) {
        console.error("Error cargando grupos:", err);
      }
    };
    loadGroups();
  }, [user.id]);

  const handleSelectGroup = async (group) => {
    setLoading(true);
    setSelectedGroup(group);
    try {
      const response = await teacherService.getGroupStudents(group.group_id, group.subject_id);
      const studentsData = response.data ? response.data : response;
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (err) {
      console.error("Error al cargar estudiantes:", err);
      alert("Error cargando alumnos.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrade = async (enrollmentId, grades) => {
    try {
      const p1 = parseFloat(grades.p1) || 0;
      const p2 = parseFloat(grades.p2) || 0;
      // Solo dividimos entre 2 porque son 2 parciales
      const finalScore = ((p1 + p2) / 2).toFixed(1);

      await teacherService.updateGrade({
        enrollmentId,
        subjectId: selectedGroup.subject_id,
        p1, 
        p2, 
        p3: 0, // Mandamos el 3er parcial en 0 para no afectar la base de datos
        finalScore
      });
      alert(`¡Calificación guardada! Promedio: ${finalScore}`);
      return true; // Retornamos true para saber que fue exitoso y bloquear los inputs
    } catch (err) {
      console.error("Error al guardar:", err);
      alert('Error al guardar la calificación');
      return false; // Retornamos false si falló
    }
  };

  return (
    <div className="teacher-container">
      <header className="teacher-header">
        <div className="header-info">
          <h1>Panel del Profesor</h1>
          <p className="welcome-text">
            <UserCircle size={20} className="inline-icon" /> 
            Bienvenido, <strong>{teacherName}</strong>
          </p>
        </div>
      </header>

      {!selectedGroup && (
        <div className="groups-section">
          <h2>Tus Grupos Asignados</h2>
          <div className="groups-grid">
            {groups.length > 0 ? (
              groups.map((group, index) => (
                <div key={index} className="group-card" onClick={() => handleSelectGroup(group)}>
                  <div className="group-card-header">
                    <Users size={24} className="icon-group" />
                    <h3>Grupo {group.grupo}</h3>
                  </div>
                  <div className="group-card-body">
                    <p><strong>Materia:</strong> {group.materia}</p>
                    <p><strong>Periodo:</strong> {group.periodo}</p>
                    <p><strong>Salón:</strong> {group.classroom}</p>
                  </div>
                  <button className="btn-view-students">Ver Alumnos y Calificar</button>
                </div>
              ))
            ) : (
              <p className="no-data">No tienes grupos asignados en este periodo.</p>
            )}
          </div>
        </div>
      )}

      {selectedGroup && (
        <div className="students-section">
          <div className="students-header">
            <button className="btn-back" onClick={() => setSelectedGroup(null)}>
              <ChevronLeft size={20} /> Volver a Grupos
            </button>
            <div className="students-header-titles">
              <h2>Alumnos - Grupo {selectedGroup.grupo}</h2>
              <h3 className="subject-subtitle">Materia: {selectedGroup.materia}</h3>
            </div>
          </div>

          {loading ? (
            <p className="loading-text">Cargando alumnos...</p>
          ) : (
            <div className="table-wrapper">
              <table className="teacher-table">
                <thead>
                  <tr>
                    <th>Nombre del Alumno</th>
                    <th>Matrícula</th>
                    <th className="text-center">Parcial 1</th>
                    <th className="text-center">Parcial 2</th>
                    <th className="text-center">Promedio</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length > 0 ? (
                    students.map((s) => (
                      <StudentRow key={s.student_id || s.enrollment_id} student={s} onSave={handleSaveGrade} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center p-4">No hay alumnos inscritos en este grupo.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StudentRow = ({ student, onSave }) => {
  // Verificamos si ya hay calificaciones en la bd (si p1 es nulo, significa que no ha sido calificado)
  const hasSavedGrades = student.p1 !== null && student.p1 !== undefined;
  
  // Si ya tiene calificaciones, el modo edición empieza en "false" (bloqueado). Si es nuevo, en "true"
  const [isEditing, setIsEditing] = useState(!hasSavedGrades);

  const [grades, setGrades] = useState({
    p1: student.p1 !== null ? student.p1 : '',
    p2: student.p2 !== null ? student.p2 : ''
  });

  const p1Num = parseFloat(grades.p1) || 0;
  const p2Num = parseFloat(grades.p2) || 0;
  
  // Promedio de 2 parciales
  const hasGrades = grades.p1 !== '' || grades.p2 !== '';
  const currentAverage = hasGrades ? ((p1Num + p2Num) / 2).toFixed(1) : '0.0';

  const handleSaveClick = async () => {
    // onSave ahora nos devuelve true si la bd se actualizó correctamente
    const success = await onSave(student.enrollment_id, grades);
    if (success) {
      setIsEditing(false); // Bloqueamos la edición una vez guardado
    }
  };

  return (
    <tr>
      <td className="student-name font-medium">{student.full_name}</td>
      <td className="student-matricula">{student.matricula}</td>
      
      {/* CELDA PARCIAL 1 */}
      <td className="text-center">
        {isEditing ? (
          <input 
            type="number" step="0.1" min="0" max="10"
            className="grade-input" 
            value={grades.p1} 
            onChange={e => setGrades({...grades, p1: e.target.value})} 
            placeholder="-"
          />
        ) : (
          <span className="grade-text">{grades.p1 || '-'}</span>
        )}
      </td>
      
      {/* CELDA PARCIAL 2 */}
      <td className="text-center">
        {isEditing ? (
          <input 
            type="number" step="0.1" min="0" max="10"
            className="grade-input" 
            value={grades.p2} 
            onChange={e => setGrades({...grades, p2: e.target.value})} 
            placeholder="-"
          />
        ) : (
          <span className="grade-text">{grades.p2 || '-'}</span>
        )}
      </td>

      <td className="text-center">
        <span className={`font-bold ${currentAverage >= 7 ? 'text-green-600' : 'text-red-600'}`}>
          {currentAverage}
        </span>
      </td>
      <td className="text-center">
        {isEditing ? (
          <button className="btn-save" onClick={handleSaveClick}>
            <Save size={16} style={{ marginRight: '5px' }} /> Guardar
          </button>
        ) : (
          <button className="btn-edit" onClick={() => setIsEditing(true)}>
            <Edit size={16} style={{ marginRight: '5px' }} /> Editar
          </button>
        )}
      </td>
    </tr>
  );
};

export default TeacherDashboard;