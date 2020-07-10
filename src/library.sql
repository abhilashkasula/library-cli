-- SQLite
DROP TABLE IF EXISTS books;
CREATE TABLE books (
  s_id INTEGER PRIMARY KEY AUTOINCREMENT,
  isbn NUMERIC(5) NOT NULL,
  is_available Boolean DEFAULT TRUE
);

DROP TABLE IF EXISTS book_details;
CREATE TABLE IF NOT EXISTS book_details (
  isbn NUMERIC(5) PRIMARY KEY,
  title VARCHAR(20) NOT NULL,
  category VARCHAR(15)
);

DROP TABLE IF EXISTS authors;
CREATE TABLE authors (
  isbn NUMERIC(5) PRIMARY KEY,
  author VARCHAR(20) NOT NULL
);

DROP TABLE IF EXISTS publishers;
CREATE TABLE publishers (
  isbn NUMERIC(4) PRIMARY KEY,
  publisher VARCHAR(20) NOT NULL
);

DROP TABLE IF EXISTS borrowers;
CREATE TABLE borrowers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(20),
  registered_at datetime
);

DROP TABLE IF EXISTS log;
CREATE TABLE log (
  s_id INTEGER NOT NULL,
  borrower_id NUMERIC(5),
  action VARCHAR(10),
  time DATETIME
);

SELECT *
from books;
SELECT *
from book_details;
SELECT *
from authors;
SELECT *
from publishers;
SELECT *
from borrowers;
SELECT *
from log;
UPDATE books
SET is_availabe = 0;


--Look at the books
WITH copies as (
  SELECT isbn,
    count(*) as count
  from books
  GROUP BY isbn
),
b AS (
  SELECT isbn,
    CASE
      WHEN is_availabe = 0 THEN NULL
      ELSE 1
    END as flag
  FROM books
),
c AS (
  SELECT isbn,
    count(flag) as count
  from b
  GROUP BY isbn
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
  JOIN c on c.isbn = t4.isbn;


--Look at available books
WITH copies as (
  SELECT isbn,
    count(*) as count
  from books
  GROUP BY isbn
),
b AS (
  SELECT isbn,
    COUNT(*) as count
  FROM books
  WHERE is_availabe = 1
  GROUP BY isbn
)
SELECT t1.isbn,
  t1.title,
  t1.category,
  t2.author,
  t3.publisher,
  t4.count as total_copies,
  b.count as available
FROM book_details t1
  JOIN authors t2 ON t1.isbn = t2.isbn
  JOIN publishers t3 ON t2.isbn = t3.isbn
  JOIN copies t4 ON t3.isbn = t4.isbn
  JOIN b on b.isbn = t4.isbn;


--Look at the borrowers 
SELECT *
from borrowers;


--add a book
BEGIN;
INSERT INTO book_details
VALUES (2222, 'another book', 'fantacy');
INSERT INTO authors
VALUES (2222, 'ABC');
INSERT INTO publishers
VALUES (2222, 'XYZ');
INSERT INTO books (isbn)
VALUES (2222),
  (2222),
  (2222);
END;


--add a borrower
INSERT INTO borrowers (borrower_name)
VALUES('John');


--add copies
SELECT *
from book_details
WHERE isbn = 1111;
--if available, then
INSERT INTO books (isbn)
VALUES (1111);


--issue a book
BEGIN;
SELECT s_id
FROM books
where isbn = 2222
  AND is_availabe = 1;
--if available, pick one s_id.. Then
SELECT *
from borrowers
WHERE borrower_id = 1;
--if available, then
UPDATE books
SET is_availabe = 0
WHERE s_id = 4;
INSERT INTO log
values (4, 1, 'issue', DATETIME('now'));
END;


--return a book
BEGIN;
SELECT *
from log
where borrower_id = 1
ORDER BY time DESC;
--then go and check whether he took the book, then
UPDATE books
set is_availabe = 1
WHERE s_id = 4;
INSERT INTO log
values (4, 1, 'return', DATETIME('now'));
END;


SELECT *
from books;
--