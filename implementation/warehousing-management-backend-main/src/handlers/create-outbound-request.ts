import OracleDB from "oracledb";
import { database } from "../database/connection";

export const createOutboundRequest = async (
  productId: string,
  body: {
    quantity: number;
  }
): Promise<
  {
    zoneId: number;
    quantity: number;
  }[]
> => {
  const connection = await database.getConnection();

  const bindVars = {
    productId_input: productId,
    requestedQuantity: body.quantity,
    RESULT_CURSOR: { type: OracleDB.CURSOR, dir: OracleDB.BIND_OUT },
  };
  const result = await connection.execute<{
    RESULT_CURSOR: OracleDB.ResultSet<[number, number]>;
  }>(
    `BEGIN
         :RESULT_CURSOR := product_outbound(:productId_input, :requestedQuantity);
       END;`,
    bindVars
  );
  const resultSet = result.outBinds?.RESULT_CURSOR;

  if (!resultSet) {
    throw new Error("No result set found");
  }

  const rows = await resultSet.getRows();

  await database.commit(connection);

  await database.closeConnection(connection);

  return rows.map((row) => ({
    zoneId: row[0],
    quantity: row[1],
  }));
};
