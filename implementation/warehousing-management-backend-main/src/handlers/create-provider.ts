import OracleDB from "oracledb";
import { database } from "../database/connection";

export const createProvider = async ({
  providerName,
}: {
  providerName: string;
}) => {
  const connection = await database.getConnection();

  const result = await connection.execute<{
    ret: number;
  }>(`BEGIN :ret := createProvider(:p_providerName,:p_createdAt); END;`, {
    ret: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
    p_providerName: providerName,
    p_createdAt: new Date(),
  });

  if (!result.outBinds) {
    throw new Error("Failed to create provider");
  }

  await database.commit(connection);

  await database.closeConnection(connection);

  return result.outBinds.ret;
};
