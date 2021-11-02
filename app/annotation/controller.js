const db = require("../../db/db");
const { v4: uuidv4 } = require("uuid");
const validator = require("validator");
const path = require("path");
const fs = require("fs");
const config = require("../../config/config");

module.exports = {
  getAnnotations: async (req, res) => {
    try {
      const stores = await db.query("SELECT * FROM Annotations");
      res.status(200).json({ data: stores.rows });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  getAnnotation: async (req, res) => {
    try {
      const { id } = req.params;
      const store = await db.query(`SELECT * FROM annotations WHERE uid = $1`, [
        id,
      ]);
      if (store === null || undefined || "") {
        res.status(404).json({ message: "Data tidak ditemukan" });
      }
      res.status(200).json({ data: store.rows[0] });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  getAnnotationByBooth: async (req, res) => {
    try {
      const { boothid } = req.params;
      const store = await db.query(
        `SELECT * FROM annotations  ations WHERE boothid = $1`,
        [boothid]
      );
      if (store === null || undefined || "") {
        res.status(404).json({ message: "Data tidak ditemukan" });
      }
      res.status(200).json({ data: store.rows });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
};
