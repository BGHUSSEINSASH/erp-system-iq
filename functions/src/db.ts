import sql from "mssql";

type SqlConfig = {
  user: string;
  password: string;
  database: string;
  server: string;
  options: { encrypt: boolean; trustServerCertificate: boolean };
};

export function getSqlConfig(): SqlConfig {
  return {
    user: process.env.SQL_USER ?? "",
    password: process.env.SQL_PASSWORD ?? "",
    database: process.env.SQL_DATABASE ?? "",
    server: process.env.SQL_SERVER ?? "",
    options: {
      encrypt: (process.env.SQL_ENCRYPT ?? "true") === "true",
      trustServerCertificate: true
    }
  };
}

export async function openSqlConnection() {
  const config = getSqlConfig();
  return sql.connect(config);
}
