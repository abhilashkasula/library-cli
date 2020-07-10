const booksQuery = () => {
  return `WITH copies as (
    SELECT isbn,
      count(*) as count
    from books
    GROUP BY isbn
  ), b AS (
    SELECT isbn,
      CASE
        WHEN is_available = 0 THEN NULL
        ELSE 1
      END as flag
    FROM books
  ), c AS (
    SELECT isbn,
      count(flag) as count
    FROM b GROUP BY isbn
  )
  SELECT t1.isbn,
    t1.title,
    t1.category,
    t2.author,
    t3.publisher,
    t4.count as total_copies,
    c.count as available
  FROM book_details t1
    JOIN authors t2 ON t1.isbn = t2.isbn
    JOIN publishers t3 ON t2.isbn = t3.isbn
    JOIN copies t4 ON t3.isbn = t4.isbn
    JOIN c on c.isbn = t4.isbn;`;
};

const insertInto = (table, fields, values) => {
  return `
  INSERT INTO ${table}
    (${fields.join(',')})
    VALUES ${values.join(',')};`;
};

const insertBorrower = (name) => {
  const fields = ['name', 'registered_at'];
  const values = [`('${name}'`, `DATETIME('now'))`];
  return insertInto('borrowers', fields, values);
};

const insertBookDetail = (isbn, title, category) => {
  const fields = ['isbn', 'title', 'category'];
  const values = [`(${isbn}`, `'${title}'`, `'${category}')`];
  return insertInto('book_details', fields, values);
};

const insertAuthor = (isbn, author) => {
  const values = [`(${isbn}, '${author}')`];
  return insertInto('authors', ['isbn', 'author'], values);
};

const insertPublisher = (isbn, publisher) => {
  const values = [`(${isbn}, '${publisher}')`];
  return insertInto('publishers', ['isbn', 'publisher'], values);
};

const generateVals = (times, val, list) => {
  if (!times) return list;
  return generateVals(times - 1, val, list.concat(val));
};

const insertCopies = (isbn, copies) => {
  const values = generateVals(copies, `(${isbn})`, []);
  return insertInto('books', ['isbn'], values);
};

const transaction = (query) => `BEGIN; ${query}END;`;

const insertBook = ({isbn, title, category, author, publisher, copies}) => {
  const queries = `
    ${insertBookDetail(isbn, title, category)}
    ${insertAuthor(isbn, author)}
    ${insertPublisher(isbn, publisher)}
    ${insertCopies(isbn, copies)}`;
  return transaction(queries);
};

const selectAll = (table, condition) => {
  return `SELECT * FROM ${table} ${condition}`;
};

const insertLog = (sId, bId, action) => {
  const fields = ['s_id', 'borrower_id', 'action', 'time'];
  const values = [`(${sId}, ${bId}, '${action}', DATETIME('now'))`];
  return insertInto('log', fields, values);
};

const issue = (sId, bId) => {
  const queries = `
    UPDATE books set is_available = 0 WHERE s_id = ${sId};
    ${insertLog(sId, bId, 'issue')}`;
  return transaction(queries);
};

const returnBook = ({serialNo, borrowerId}) => {
  const queries = `
    UPDATE books set is_available = 1 WHERE s_id = ${serialNo};
    ${insertLog(serialNo, borrowerId, 'borrow')}`;
  return transaction(queries);
};

const selectDetailsWithIsbn = (isbn) => {
  return selectAll('book_details', `WHERE isbn = ${isbn}`);
};

const selectBorrowersWithId = (id) => {
  return selectAll('borrowers', `WHERE id = ${id}`);
};

const selectAvailableCopiesByIsbn = (isbn) => {
  return selectAll('books', `WHERE isbn = ${isbn} AND is_available = 1`);
};

const selectLogBySerialAndBorrower = ({serialNo, borrowerId}) => {
  const condition = `WHERE s_id = ${serialNo} and borrower_id = ${borrowerId} ORDER BY time DESC`;
  return selectAll('log', condition);
};

const initializeTables = () => {
  return `CREATE TABLE IF NOT EXISTS books (
    s_id INTEGER PRIMARY KEY AUTOINCREMENT,
    isbn NUMERIC(5) NOT NULL,
    is_available Boolean DEFAULT TRUE
  );
  
  CREATE TABLE IF NOT EXISTS book_details (
    isbn NUMERIC(5) PRIMARY KEY,
    title VARCHAR(20) NOT NULL,
    category VARCHAR(15)
  );
  
  CREATE TABLE IF NOT EXISTS authors (
    isbn NUMERIC(5) PRIMARY KEY,
    author VARCHAR(20) NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS publishers (
    isbn NUMERIC(4) PRIMARY KEY,
    publisher VARCHAR(20) NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS borrowers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(20),
    registered_at datetime
  );
  
  CREATE TABLE IF NOT EXISTS log (
    s_id INTEGER NOT NULL,
    borrower_id NUMERIC(5),
    action VARCHAR(10),
    time DATETIME
  );`;
};

module.exports = {
  booksQuery,
  insertBorrower,
  insertBook,
  insertCopies,
  selectAll,
  issue,
  returnBook,
  selectDetailsWithIsbn,
  selectBorrowersWithId,
  selectAvailableCopiesByIsbn,
  selectLogBySerialAndBorrower,
  initializeTables,
};
