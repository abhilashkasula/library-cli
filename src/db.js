class DB {
  constructor(db) {
    this.db = db;
  }

  all(query) {
    return new Promise((resolve) => {
      this.db.all(query, (err, res) => resolve(res));
    });
  }

  exec(query) {
    return new Promise((resolve, reject) => {
      this.db.exec(query, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  get(query) {
    return new Promise((resolve, reject) => {
      this.db.get(query, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  serialize(callback) {
    this.db.serialize(callback);
  }

  static load(dbClient, query) {
    const db = new DB(dbClient);
    db.exec(query);
    return db;
  }
}

// const all = (db, query) => {
//   return new Promise((resolve) => {
//     db.all(query, (err, res) => resolve(res));
//   });
// };

// const exec = (db, query) => {
//   return new Promise((resolve, reject) => {
//     db.exec(query, (err) => {
//       if (err) return reject(err);
//       resolve();
//     });
//   });
// };

// const get = (db, query) => {
//   return new Promise((resolve, reject) => {
//     db.get(query, (err, row) => {
//       if (err) return reject(err);
//       resolve(row);
//     });
//   });
// };

// const serialize = (db, callback) => {
//   db.serialize(callback);
// };

module.exports = DB;
