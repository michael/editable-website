import pgPromise from 'pg-promise';
import camelcaseKeys from 'camelcase-keys';

const pgOptions = {
  receive: ({ data }) => {
    camelizeColumns(data);
  }
};

const camelizeColumns = data => {
  const template = data[0];
  for (const prop in template) {
    const camel = pgPromise.utils.camelize(prop);
    if (!(camel in template)) {
      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        d[camel] = d[prop];
        delete d[prop];
      }
    }
  }
};

const DB_SSL = import.meta.env.VITE_DB_SSL;
const DB_URL = import.meta.env.VITE_DB_URL;

const pgp = pgPromise(pgOptions);

// Configure types
// https://github.com/vitaly-t/pg-promise/wiki/FAQ#how-to-access-the-instance-of-node-postgres-thats-used

const types = pgp.pg.types;
// Use strings to represent timestamps rather than a Date object (pg default)
types.setTypeParser(types.builtins.TIMESTAMPTZ, function (val) {
  return new Date(val).toJSON();
});
types.setTypeParser(types.builtins.DATE, function (val) {
  return val;
});
types.setTypeParser(types.builtins.JSON, function (val) {
  const json = camelcaseKeys(JSON.parse(val), { deep: true });
  return json;
});

// Default number parsing Postgres -> JS Types (maybe consider going away from numeric for performance gains and automatic conversion to JS floats)
// smallint:         parseInt()
// integer:          parseInt()
// bigint:           string
// decimal:          string
// numeric:          string
// real:             parseFloat()
// double precision: parseFloat()
// smallserial:      parseInt()
// serial:           parseInt()
// bigserial:        string

// Singleton usage as described here
// https://www.codeoftheprogrammer.com/2020/01/16/postgresql-from-nextjs-api-route/

// Avoid self-signed ssl errors (with DigitalOcean) as described here
// https://www.javaniceday.com/post/pg-promise-self-signed-certificate-error-in-postgres

let ssl = null;
if (DB_SSL) {
  ssl = { rejectUnauthorized: false };
}

// Or you can use it this way
const config = {
  connectionString: DB_URL, // 'postgres://john:pass123@localhost:5432/products',
  max: 30,
  ssl
};

// Use a symbol to store a global instance of a connection, and to access it from the singleton.
const DB_KEY = Symbol.for('The.db');
const globalSymbols = Object.getOwnPropertySymbols(global);
const hasDb = globalSymbols.indexOf(DB_KEY) > -1;
if (!hasDb) {
  global[DB_KEY] = pgp(config);
}

// Create and freeze the singleton object so that it has an instance property.
const singleton = {};
Object.defineProperty(singleton, 'instance', {
  get: function () {
    return global[DB_KEY];
  }
});
Object.freeze(singleton);

export default singleton;
