import * as mysql from 'mysql';

/* Options */
let Connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DATABASE
});

/* Functions */
function query (query: string, options?: any[]) {
    return new Promise<any>((resolve, reject) => {
        Connection.query(query, options, function (error:any, results:any[]) {
            if (error) reject(error);
            resolve(results);
        });
    });
};

/* Function Exports */
export {query}