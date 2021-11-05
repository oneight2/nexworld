const db = require("../../db/db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const validator = require("validator");

module.exports = {
  getGuests: async (req, res) => {
    const currentPage = req.query.page || 1;
    const perPage = req.query.perPage || 5;
    let page = (currentPage - 1) * perPage;
    let totalData;
    try {
      const guest = await db.query("SELECT * FROM guests");
      totalData = guest.rowCount;

      const guests = await db.query("SELECT * FROM guests LIMIT $1 OFFSET $2", [
        perPage,
        page,
      ]);
      res.status(200).json({
        totalData,
        page: parseInt(currentPage),
        perPage,
        data: guests.rows,
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  getGuest: async (req, res) => {
    try {
      const { id } = req.params;
      const guest = await db.query(`SELECT * FROM guests WHERE uid = $1`, [id]);
      if (!guest?.rows[0]) {
        res.status(404).json({ message: "Data tidak ditemukan" });
      }
      res.status(200).json({ data: guest.rows[0] });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  addGuest: async (req, res) => {
    try {
      const { email, password, name } = req.body;

      const uid = uuidv4();
      const created_at = new Date();
      if (email) {
        if (!validator.isEmail(email)) {
          res.status(500).json({ message: `Format email tidak sesuai` });
        } else {
          if (!password) {
            await db.query(
              `INSERT into guests (uid, email, name, created_at) values ($1, $2, $3, $4)`,
              [uid, email, name, created_at]
            );
          } else {
            let salt = await bcrypt.genSalt(saltRounds);
            const hash = await bcrypt.hash(password, salt);
            await db.query(
              `INSERT into guests (uid, email, password, name, created_at) values ($1, $2, $3, $4, $5)`,
              [uid, email, hash, name, created_at]
            );
          }
        }
      }

      res
        .status(200)
        .json({ status: "Success", message: "Add Guest Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  updateGuest: async (req, res) => {
    try {
      const { id } = req.params;
      const { email, password, name } = req.body;

      if (email) {
        if (!validator.isEmail(email)) {
          res.status(500).json({ message: `Format email tidak sesuai` });
        } else {
          if (!password) {
            await db.query(
              `UPDATE guests SET (email, name) = ($2, $3) where uid = $1`,
              [id, email, name]
            );
          } else {
            let salt = await bcrypt.genSalt(saltRounds);
            const hash = await bcrypt.hash(password, salt);
            await db.query(
              `UPDATE guests SET (email, password, name) = ($2, $3, $4) where uid = $1`,
              [id, email, hash, name]
            );
          }
        }
      }
      res
        .status(200)
        .json({ status: "Success", message: "Update Guest Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  deleteGuest: async (req, res) => {
    try {
      const { id } = req.params;
      await db.query(`DELETE from guests WHERE uid = $1`, [id]);
      res
        .status(200)
        .json({ status: "Success", message: "Delete Guest Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  search: async (req, res) => {
    try {
      const query = req.query.search;
      const guest = await db.query(
        `SELECT * FROM guests WHERE concat(email, name) ILIKE '%'|| $1 ||'%'`,
        [query]
      );
      if (!Array.isArray(guest.rows) || !guest.rows.length) {
        res.status(404).json({ message: "Data tidak ditemukan" });
      } else {
        res.status(200).json({ data: guest.rows });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
};
