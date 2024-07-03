import OracleDB from "oracledb";
import { database } from "../database/connection";
import { Provider } from "../entities/provider";

export const getProviders = async (): Promise<Provider[]> => {
  const connection = await database.getConnection();

  const result = await connection.execute<{
    cursor: OracleDB.ResultSet<[number, string, Date]>;
  }>(
    `BEGIN
      :cursor := get_all_providers;
    END;`,
    {
      cursor: { dir: OracleDB.BIND_OUT, type: OracleDB.CURSOR },
    }
  );

  if (!result.outBinds || !result.outBinds.cursor) {
    throw new Error("Failed to fetch providers");
  }

  const resultSet = result.outBinds.cursor;
  const providers = await resultSet.getRows();
  await resultSet.close();

  await database.closeConnection(connection);

  return providers.map((row: any) => ({
    id: row[0],
    name: row[1],
    createdAt: row[2],
  }));
};
