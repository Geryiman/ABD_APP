const pool = require('../config/db');

const getTeachers = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, full_name, matricula FROM users WHERE role = 'teacher'");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSubjects = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM subjects");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const assignGroup = async (req, res) => {
  const { name, subject_id, teacher_id, period_id, classroom } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO groups (name, subject_id, teacher_id, period_id, classroom) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, subject_id, teacher_id, period_id, classroom]
    );
    res.json({ message: 'Grupo creado exitosamente', group: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al asignar materia. Verifica duplicados.' });
  }
};

module.exports = { getTeachers, getSubjects, assignGroup };