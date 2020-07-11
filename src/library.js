const vorpal = require('vorpal')();
const sqlite3 = require('sqlite3');
const chalk = require('chalk');
const DB = require('./db');
const queries = require('./queries');
const prompt = require('./prompt');

const dbClient = new sqlite3.Database('library.db');
const db = DB.load(dbClient, queries.initializeTables());

vorpal.delimiter(chalk.yellow.yellow('library$ ')).show();

const drawTableAndCall = (rows, cb) => {
  console.table(rows);
  cb();
};

vorpal.command('borrowers').action((args, cb) => {
  db.all(queries.selectAll('borrowers', '')).then((rows) => {
    drawTableAndCall(rows, cb);
  });
});

vorpal.command('logs').action((args, cb) => {
  db.all(queries.selectAll('log', '')).then((rows) => {
    drawTableAndCall(rows, cb);
  });
});

vorpal.command('register <name>').action((args, cb) => {
  db.serialize(() => {
    db.exec(queries.insertBorrower(args.name));
    db.get(queries.selectBorrowersOrderByRegistered()).then((row) => {
      const msg = `Successfully registered ${args.name} with id: ${row.id}\n`;
      cb(chalk.green(msg));
    });
  });
});

vorpal.command('add-book').action(function (args, cb) {
  this.prompt(prompt.addBookPrompt(), (res) => {
    const msg = `Successfully added the book with isbn: ${res.isbn}\n`;
    const errMsg = chalk.red('Book already exists\n');
    db.exec(queries.insertBook(res))
      .then(() => cb(chalk.green(msg)))
      .catch(() => db.exec('ROLLBACK;').then(() => cb(errMsg)));
  });
});

vorpal.command('add-copies <isbn> <copies>').action(({isbn, copies}, cb) => {
  db.get(queries.selectDetailsWithIsbn(isbn)).then((row) => {
    if (!row) {
      return cb(chalk.red(`Book with isbn ${isbn} doesn't exist\n`));
    }
    const msg = `Successfully added ${copies} copies to ${isbn}\n`;
    db.exec(queries.insertCopies(isbn, copies))
      .then(() => cb(chalk.green(msg)))
      .catch(() => db.exec('ROLLBACK;'));
  });
});

vorpal.command('issue <isbn> <borrowerId>').action(({isbn, borrowerId}, cb) => {
  db.get(queries.selectBorrowersWithId(borrowerId)).then((row) => {
    if (!row) {
      return cb(chalk.red(`Borrower with id ${borrowerId} isn't found\n`));
    }
    db.get(queries.selectAvailableCopiesByIsbn(isbn)).then((row) => {
      if (!row) {
        return cb(chalk.red(`There is no book available with isbn ${isbn}\n`));
      }
      db.exec(queries.issue(row.s_id, borrowerId)).then(() => {
        const msg = `Successfully issued book with s_id ${row.s_id} to ${borrowerId}\n`;
        cb(chalk.green(msg));
      });
    });
  });
});

vorpal.command('return <serialNo> <borrowerId>').action((args, cb) => {
  db.get(queries.selectLogBySerialAndBorrower(args)).then((row) => {
    if (!row || row.action != 'issue') {
      const err = `Borrower with id ${args.borrowerId} isn't holding this book\n`;
      return cb(chalk.red(err));
    }
    db.exec(queries.returnBook(args)).then(() => {
      const msg = `Successfully returned the book with s_id ${args.serialNo}\n`;
      cb(chalk.green(msg));
    });
  });
});

vorpal.command('clear', 'Clears the screen').action((args, cb) => {
  console.clear();
  cb();
});

const getBooksOptionValues = () => ({
  a: 'author',
  c: 'category',
  i: 'isbn',
  t: 'title',
  p: 'publisher',
});

vorpal
  .command('books')
  .option('-a <author>', 'Search books by author')
  .option('-c <category>', 'Search books by category')
  .option('-i <isbn>', 'Search books by isbn')
  .option('-t <title>', 'Search books by title')
  .option('-p <publisher>', 'Search books by publisher')
  .option('-A', 'Shows only available books')
  .action((args, cb) => {
    db.all(queries.booksQuery()).then((rows) => {
      const keys = getBooksOptionValues();
      const options = Object.keys(args.options);
      const filtered = options.reduce((filtered, option) => {
        if (option === 'A') return filtered.filter((row) => row.available > 0);
        const regExp = new RegExp(`${args.options[option]}`, 'i');
        return filtered.filter((row) => `${row[keys[option]]}`.match(regExp));
      }, rows);
      drawTableAndCall(filtered, cb);
    });
  });
