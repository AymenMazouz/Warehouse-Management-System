import OracleDB from "oracledb";

const database = {
  getConnection: async () => {
    try {
      const connection = await OracleDB.getConnection({
        user: "C##WAREHOUSE",
        password: "root",
        connectString: "localhost:1521/xe",
      });
      return connection;
    } catch (e) {
      throw new Error("Unable to connect to the database");
    }
  },
  commit: async (connection: OracleDB.Connection) => {
    await connection.commit();
  },
  rollback: async (connection: OracleDB.Connection) => {
    await connection.rollback();
  },
  closeConnection: async (connection: OracleDB.Connection) => {
    await connection.close();
  },
};

export { database };
