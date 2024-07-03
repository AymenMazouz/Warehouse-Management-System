import OracleDB from "oracledb";
import { database } from "../database/connection";

export const createProduct = async ({
  productName,
  description,
  cost,
  height,
  length,
  weight,
  width,
  providerId,
}: {
  productName: string;
  description: string;
  cost: number;
  height: number;
  length: number;
  weight: number;
  width: number;
  providerId: number;
}) => {
  const connection = await database.getConnection();

  const result = await connection.execute<{
    ret: number;
  }>(
    `BEGIN :ret := createProduct(:p_productName, :p_description, :p_cost, :p_quantity, :p_height, :p_length, :p_weight, :p_width, :p_providerId); END;`,
    {
      ret: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
      p_productName: productName,
      p_description: description,
      p_cost: cost,
      p_quantity: 0,
      p_height: height,
      p_length: length,
      p_weight: weight,
      p_width: width,
      p_providerId: providerId,
    }
  );

  if (!result.outBinds) {
    throw new Error("Failed to create product");
  }

  await database.commit(connection);

  await database.closeConnection(connection);

  return result.outBinds.ret;
};
