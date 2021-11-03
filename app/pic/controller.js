const db = require("../../db/db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const validator = require("validator");

module.exports = {
  getPics: async (req, res) => {
    const currentPage = req.query.page || 1;
    const perPage = req.query.perPage || 5;
    let page = (currentPage - 1) * perPage;
    let totalData;
    try {
      const store = await db.query("SELECT * FROM pics");
      totalData = store.rowCount;

      const pics = await db.query("SELECT * FROM pics LIMIT $1 OFFSET $2", [
        perPage,
        page,
      ]);
      res.status(200).json({
        totalData,
        page: parseInt(currentPage),
        perPage,
        data: pics.rows,
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  getPicsByPartner: async (req, res) => {
    const currentPage = req.query.page || 1;
    const perPage = req.query.perPage || 5;
    let page = (currentPage - 1) * perPage;
    let totalData;
    try {
      const { partnerid } = req.params;
      const store = await db.query("SELECT * FROM pics WHERE partnerid = $1", [
        partnerid,
      ]);
      totalData = store.rowCount;
      const pics = await db.query(
        "SELECT * FROM pics WHERE partnerid = $1 LIMIT $2 OFFSET $3",
        [partnerid, perPage, page]
      );
      if (pics === null || undefined || "") {
        res.status(404).json({ message: "Data tidak ditemukan" });
      }
      res.status(200).json({
        totalData,
        page: parseInt(currentPage),
        perPage,
        data: pics.rows,
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  getPic: async (req, res) => {
    try {
      const { id } = req.params;
      const pic = await db.query(`SELECT * FROM pics WHERE uid = $1`, [id]);
      if (pic === null || undefined || "") {
        res.status(404).json({ message: "Data tidak ditemukan" });
      }
      res.status(200).json({ data: pic.rows[0] });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  addPic: async (req, res) => {
    try {
      const { email, password, name, phone, partnerid } = req.body;

      let salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);
      const uid = uuidv4();
      const created_at = new Date();
      if (email) {
        if (!validator.isEmail(email)) {
          res.status(500).json({ message: `Format email tidak sesuai` });
        } else {
          await db.query(
            `INSERT into pics (uid, email, password, name, phone, created_at, partnerid) values ($1, $2, $3, $4, $5, $6, $7)`,
            [uid, email, hash, name, phone, created_at, partnerid]
          );
        }
      }

      res.status(200).json({ status: "Success", message: "Add Pic Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  updatePic: async (req, res) => {
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
            `UPDATE pics SET (email, password, name, phone) = ($2, $3, $4, $5) where uid = $1`,
            [id, email, hash, name, phone]
          );
          res
            .status(200)
            .json({ status: "Success", message: "Update Pic Success!" });
        }
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  deletePic: async (req, res) => {
    try {
      const { id } = req.params;
      await db.query(`DELETE from pics WHERE uid = $1`, [id]);
      res
        .status(200)
        .json({ status: "Success", message: "Delete Pic Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
};
