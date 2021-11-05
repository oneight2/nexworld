const db = require("../../db/db");
const { v4: uuidv4 } = require("uuid");
const validator = require("validator");
const path = require("path");
const fs = require("fs");
const config = require("../../config/config");

module.exports = {
  getStores: async (req, res) => {
    try {
      const stores = await db.query("SELECT * FROM stores");
      res.status(200).json({ data: stores.rows });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  getStore: async (req, res) => {
    try {
      const { id } = req.params;
      const store = await db.query(`SELECT * FROM stores WHERE uid = $1`, [id]);
      if (!store?.rows[0]) {
        res.status(404).json({ message: "Data tidak ditemukan" });
      }
      res.status(200).json({ data: store.rows[0] });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  addStore: async (req, res) => {
    try {
      const { name, url } = req.body;
      const uid = uuidv4();
      const created_at = new Date();

      if (req.file) {
        let tmp_path = req.file.path;
        let originaExt =
          req.file.originalname.split(".")[
            req.file.originalname.split(".").length - 1
          ];
        let filename = req.file.filename + "." + originaExt;
        let target_path = path.resolve(
          config.rootPath,
          `public/store/${filename}`
        );

        const src = fs.createReadStream(tmp_path);
        const dest = fs.createWriteStream(target_path);

        src.pipe(dest);

        src.on("end", async () => {
          try {
            const image = filename;
            const imageurl = `/public/store/${filename}`;
            await db.query(
              `INSERT into stores (uid, name, url, image, created_at, imageurl) values ($1, $2, $3, $4, $5, $6)`,
              [uid, name, url, image, created_at, imageurl]
            );

            res
              .status(200)
              .json({ status: "Success", message: "Add Store Success!" });
          } catch (err) {
            res.status(500).json({
              message: err.message || `Terjadi kesalahan pada server`,
            });
          }
        });
      } else {
        await db.query(
          `INSERT into stores (uid, name, url,  created_at) values ($1, $2, $3, $4)`,
          [uid, name, url, created_at]
        );
        res
          .status(200)
          .json({ status: "Success", message: "Add Store Success!" });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  updateStore: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, url } = req.body;

      if (req.file) {
        let tmp_path = req.file.path;
        let originaExt =
          req.file.originalname.split(".")[
            req.file.originalname.split(".").length - 1
          ];
        let filename = req.file.filename + "." + originaExt;
        let target_path = path.resolve(
          config.rootPath,
          `public/store/${filename}`
        );

        const src = fs.createReadStream(tmp_path);
        const dest = fs.createWriteStream(target_path);

        src.pipe(dest);

        src.on("end", async () => {
          const image = filename;
          const imageurl = `/public/store/${filename}`;

          const imageStore = await db.query(
            `SELECT * FROM stores WHERE uid = $1`,
            [id]
          );
          let currentImage = `${config.rootPath}/public/store/${imageStore.rows[0].image}`;
          try {
            await db.query(
              `UPDATE stores SET (name,url,image, imageurl) = ($2, $3, $4, $5) where uid = $1`,
              [id, name, url, image, imageurl]
            );
            if (fs.existsSync(currentImage)) {
              fs.unlinkSync(currentImage);
            }
            res
              .status(200)
              .json({ status: "Success", message: "Update Store Success!" });
          } catch (err) {
            res.status(500).json({
              message: err.message || `Terjadi kesalahan pada server`,
            });
          }
        });
      } else {
        await db.query(
          `UPDATE Stores SET (name,url) = ($2, $3) where uid = $1`,
          [id, name, url]
        );
        res
          .status(200)
          .json({ status: "Success", message: "Update Store Success!" });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  deleteStore: async (req, res) => {
    try {
      const { id } = req.params;
      const imageStore = await db.query(`SELECT * FROM stores WHERE uid = $1`, [
        id,
      ]);
      await db.query(`DELETE from Stores WHERE uid = $1`, [id]);
      let currentImage = `${config.rootPath}/public/store/${imageStore.rows[0].image}`;
      if (fs.existsSync(currentImage)) {
        fs.unlinkSync(currentImage);
      }
      res
        .status(200)
        .json({ status: "Success", message: "Delete Store Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  search: async (req, res) => {
    try {
      const query = req.query.search;
      const store = await db.query(
        `SELECT * FROM stores WHERE concat(name, url, image) ILIKE '%'|| $1 ||'%'`,
        [query]
      );
      if (!Array.isArray(store.rows) || !store.rows.length) {
        res.status(404).json({ message: "Data tidak ditemukan" });
      } else {
        res.status(200).json({ data: store.rows });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
};
