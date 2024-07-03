import OracleDB from "oracledb";
import { database } from "../database/connection";
import { Zone } from "../entities/zone";

export const getZones = async (): Promise<Zone[]> => {
  const connection = await database.getConnection();

  const result = await connection.execute<{
    cursor: OracleDB.ResultSet<[number, string, Date]>;
  }>(
    `BEGIN
      :cursor := get_all_zones;
    END;`,
    {
      cursor: { dir: OracleDB.BIND_OUT, type: OracleDB.CURSOR },
    }
  );

  if (!result.outBinds || !result.outBinds.cursor) {
    throw new Error("Failed to fetch zones");
  }

  const resultSet = result.outBinds.cursor;
  const providers = await resultSet.getRows();
  await resultSet.close();

  await database.closeConnection(connection);

  return providers.map((row: any) => ({
    id: row[0],
    name: row[1],
  }));
};
