const pool = require('../config/db');

const getHistory = async (req, res) => {
  const { studentId } = req.params;
  try {
    const query = `
      SELECT 
        s.name as materia,
        g.name as grupo,
        ap.name as periodo,
        gr.p1, gr.p2, gr.p3, gr.final_score
      FROM enrollments e
      JOIN groups g ON e.group_id = g.id
      JOIN subjects s ON g.subject_id = s.id
      JOIN academic_periods ap ON g.period_id = ap.id
      LEFT JOIN grades gr ON gr.enrollment_id = e.id
      WHERE e.student_id = $1
      ORDER BY ap.id DESC
    `;
    const result = await pool.query(query, [studentId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getHistory };