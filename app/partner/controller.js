const db = require("../../db/db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const validator = require("validator");

module.exports = {
  getPartners: async (req, res) => {
    try {
      const booths = await db.query("SELECT * FROM pics");
      res.status(200).json({ data: booths.rows });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  getPartner: async (req, res) => {
    try {
      const { id } = req.params;
      const booth = await db.query(`SELECT * FROM Partners WHERE uid = $1`, [
        id,
      ]);
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
  addPartner: async (req, res) => {
    try {
      const { name, brand, divisi } = req.body;
      const uid = uuidv4();
      const created_at = new Date();

      await db.query(
        `INSERT into Partners (uid, name, brand, divisi, created_at) values ($1, $2, $3, $4, $5)`,
        [uid, name, brand, divisi, created_at]
      );

      res
        .status(200)
        .json({ status: "Success", message: "Add Partner Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  updatePartner: async (req, res) => {
    try {
      const { id } = req.params;
      const { email, password, name, phone } = req.body;
      let salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);

      if (email) {
        if (!validator.isEmail(email)) {
          res.status(500).json({ message: `Format email tidak sesuai` });
        } else {
          await db.query(
            `UPDATE Partners SET (email, password, name, phone) = ($2, $3, $4, $5) where uid = $1`,
            [id, email, hash, name, phone]
          );
          res
            .status(200)
            .json({ status: "Success", message: "Update Partner Success!" });
        }
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  deletePartner: async (req, res) => {
    try {
      const { id } = req.params;
      await db.query(`DELETE from Partners WHERE uid = $1`, [id]);
      res
        .status(200)
        .json({ status: "Success", message: "Delete Partner Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
};
