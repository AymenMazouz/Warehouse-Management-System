import OracleDB from "oracledb";
import { database } from "../database/connection";
import { HistoryDetailedItem } from "../entities/history";

export const getProductDetailedHistory = async (
  productId: string
): Promise<HistoryDetailedItem[]> => {
  const connection = await database.getConnection();

  const result = await connection.execute<{
    cursor: OracleDB.ResultSet<
      [
        number,
        number,
        number,
        number,
        number,
        string,
        Date,
        number,
        number,
        number,
        string,
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
        string,
        string
      ]
    >;
  }>(
    `BEGIN
        :cursor := get_detailed_history(:productId);
    END;`,
    {
      cursor: { dir: OracleDB.BIND_OUT, type: OracleDB.CURSOR },
      productId: productId,
    }
  );

  if (!result.outBinds || !result.outBinds.cursor) {
    throw new Error("Failed to fetch product summary history");
  }

  const resultSet = result.outBinds.cursor;

  const history = await resultSet.getRows();

  await resultSet.close();

  await database.closeConnection(connection);

  return history.map((item) => ({
    createdAt: item[6],
    type: item[5],
    quantity: item[2],
    product: {
      id: item[11],
      name: item[12],
    },
    zone: {
      id: item[9],
      name: item[10],
    },
  }));
};
