import OracleDB from "oracledb";
import { database } from "../database/connection";

export const createZone = async ({ zoneName }: { zoneName: string }) => {
  const connection = await database.getConnection();

  const result = await connection.execute<{
    ret: number;
  }>(`BEGIN :ret := createZone(:p_zoneName); END;`, {
    ret: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
    p_zoneName: zoneName,
  });

  if (!result.outBinds) {
    throw new Error("Failed to create zone");
  }

  await database.commit(connection);

  await database.closeConnection(connection);

  return result.outBinds.ret;
};
