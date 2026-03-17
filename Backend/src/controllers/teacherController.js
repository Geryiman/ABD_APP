const pool = require('../config/db');

const getMyGroups = async (req, res) => {
  const { teacherId } = req.params;
  try {
    const query = `
      SELECT 
        gt.group_id, 
        gt.subject_id, 
        g.group_name as grupo, 
        s.name as materia, 
        ap.name as periodo, 
        g.classroom
      FROM group_teachers gt
      JOIN groups g ON gt.group_id = g.id
      JOIN subjects s ON gt.subject_id = s.id
      JOIN academic_periods ap ON g.period_id = ap.id
      WHERE gt.user_id = $1 AND ap.is_active = TRUE
    `;
    const result = await pool.query(query, [teacherId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error en getMyGroups:", err.message); // Imprime el error exacto en consola
    res.status(500).json({ error: err.message });
  }
};

const getGroupStudents = async (req, res) => {
  const { groupId } = req.params;
  const { subjectId } = req.query; // ¡Recibimos la materia por query param!

  try {
    const query = `
      SELECT 
        u.id as student_id, 
        u.full_name, 
        u.matricula,
        e.id as enrollment_id,
        gr.p1, gr.p2, gr.p3, gr.final_score
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      LEFT JOIN grades gr ON gr.enrollment_id = e.id AND gr.subject_id = $2
      WHERE e.group_id = $1
      ORDER BY u.full_name ASC
    `;
    // Pasamos tanto el grupo como la materia
    const result = await pool.query(query, [groupId, subjectId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateGrade = async (req, res) => {
  // Ahora recibimos subjectId desde el frontend
  const { enrollmentId, subjectId, p1, p2, p3, finalScore } = req.body;
  
  try {
    const check = await pool.query(
      'SELECT id FROM grades WHERE enrollment_id = $1 AND subject_id = $2', 
      [enrollmentId, subjectId]
    );
    
    let result;
    if (check.rows.length > 0) {
      result = await pool.query(
        `UPDATE grades SET p1 = COALESCE($3, p1), p2 = COALESCE($4, p2), p3 = COALESCE($5, p3), final_score = COALESCE($6, final_score)
         WHERE enrollment_id = $1 AND subject_id = $2 RETURNING *`,
        [enrollmentId, subjectId, p1, p2, p3, finalScore]
      );
    } else {
      result = await pool.query(
        `INSERT INTO grades (enrollment_id, subject_id, p1, p2, p3, final_score) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [enrollmentId, subjectId, p1, p2, p3, finalScore]
      );
    }
    
    res.json({ message: 'Calificación guardada', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error guardando calificación' });
  }
};

module.exports = { getMyGroups, getGroupStudents, updateGrade };