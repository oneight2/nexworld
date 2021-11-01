const pgdb = require("../../db/pg");

module.exports = {
  getBooths: async (req, res) => {
    try {
      let booths = await pgdb.getBooths();
      console.log(booths);
      res.status(200).json({ data: booths });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
};
