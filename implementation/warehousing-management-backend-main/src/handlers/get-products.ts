import OracleDB from "oracledb";
import { database } from "../database/connection";
import { Product } from "../entities/product";

export const getProducts = async (): Promise<Product[]> => {
  const connection = await database.getConnection();

  const result = await connection.execute<{
    cursor: OracleDB.ResultSet<
      [
        number,
        string,
        string,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        string,
        Date
      ]
    >;
  }>(
    `BEGIN
        :cursor := get_all_products;
    END;`,
    {
      cursor: { dir: OracleDB.BIND_OUT, type: OracleDB.CURSOR },
    }
  );

  if (!result.outBinds || !result.outBinds.cursor) {
    throw new Error("Failed to fetch products");
  }

  const resultSet = result.outBinds.cursor;

  const products = await resultSet.getRows();

  await resultSet.close();

  await database.closeConnection(connection);

  return products.map((row) => ({
    id: row[0],
    name: row[1],
    description: row[2],
    cost: row[3],
    quantity: row[4],
    height: row[5],
    length: row[6],
    weight: row[7],
    width: row[8],
    provider: {
      id: row[10],
      name: row[11],
      createdAt: row[12],
    },
  }));
};
