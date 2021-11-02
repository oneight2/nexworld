const db = require("../../db/db");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  getBooths: async (req, res) => {
    try {
      const booths = await db.query("SELECT * FROM booths");
      res.status(200).json({ data: booths.rows });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  getBooth: async (req, res) => {
    try {
      const { id } = req.params;
      const booth = await db.query(`SELECT * FROM booths WHERE uid = $1`, [id]);
      if (booth === null || undefined || "") {
        res.status(404).json({ message: "Data tidak ditemukan" });
      }
      res.status(200).json({ data: booth.rows[0] });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  addBooth: async (req, res) => {
    try {
      const { number, name } = req.body;
      const uid = uuidv4();
      await db.query(
        `INSERT into booths (uid, number, name) values ($1, $2, $3)`,
        [uid, number, name]
      );
      res
        .status(200)
        .json({ status: "Success", message: "Add Booth Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  updateBooth: async (req, res) => {
    try {
      const { id } = req.params;
      const { number, name } = req.body;
      await db.query(
        `UPDATE booths SET (number, name) = ($2, $3) where uid = $1`,
        [id, number, name]
      );
      res
        .status(200)
        .json({ status: "Success", message: "Update Booth Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  deleteBooth: async (req, res) => {
    try {
      const { id } = req.params;
      await db.query(`DELETE from booths WHERE uid = $1`, [id]);
      res
        .status(200)
        .json({ status: "Success", message: "Delete Booth Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
};
