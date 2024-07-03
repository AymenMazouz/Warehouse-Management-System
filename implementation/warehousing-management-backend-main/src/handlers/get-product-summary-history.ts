import OracleDB from "oracledb";
import { database } from "../database/connection";
import { HistorySummaryItem } from "../entities/history";

export const getProductSummaryHistory = async (
  productId: string
): Promise<HistorySummaryItem[]> => {
  const connection = await database.getConnection();

  const result = await connection.execute<{
    cursor: OracleDB.ResultSet<
      [
        number,
        number,
        number,
        string,
        Date,
        number,
        number,
        number,
        number,
        string,
        string,
        number,
        string
      ]
    >;
  }>(
    `BEGIN
        :cursor := get_summary_history(:productId);
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
    createdAt: item[4],
    quantity: item[1],
    product: {
      id: item[2],
      name: item[9],
    },
    type: item[3],
  }));
};
