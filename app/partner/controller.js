const db = require("../../db/db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const validator = require("validator");

module.exports = {
  getPartners: async (req, res) => {
    try {
      const partners = await db.query("SELECT * FROM partners");
      res.status(200).json({ data: partners.rows });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  getPartner: async (req, res) => {
    try {
      const { id } = req.params;
      const partner = await db.query(`SELECT * FROM Partners WHERE uid = $1`, [
        id,
      ]);
      if (partner === null || undefined || "") {
        res.status(404).json({ message: "Data tidak ditemukan" });
      }
      res.status(200).json({ data: partner.rows[0] });
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
      const { name, brand, divisi } = req.body;

      await db.query(
        `UPDATE Partners SET (name, brand, divisi) = ($2, $3, $4) where uid = $1`,
        [id, name, brand, divisi]
      );
      res
        .status(200)
        .json({ status: "Success", message: "Update Partner Success!" });
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
