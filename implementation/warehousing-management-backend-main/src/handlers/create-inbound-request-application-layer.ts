import OracleDB from "oracledb";
import { database } from "../database/connection";

export const createInboundRequestAppLicationLayer = async (
  productId: string,
  body: {
    zonesQuantities: { zone_id: number; quantity: number }[];
  }
): Promise<{
  executionTime: number;
}> => {
  const t1 = performance.now();

  const connection = await database.getConnection();

  try {
    let total_quantity = 0;
    let requestId;
    let temporary_stock_id;
    let stock_quantity;
    let product_exists;
    let zone_exists: number | undefined;
    let stock_exists: number | undefined = 0;

    // Verify if the product exists with the provided ID
    const productCheck = await connection.execute<[number]>(
      `SELECT COUNT(*) AS product_exists FROM product WHERE id = :productId`,
      { productId: productId }
    );
    product_exists = productCheck.rows?.[0][0];

    if (product_exists === 0) {
      throw new Error(`Product with ID ${productId} does not exist`);
    }

    // Calculate total quantity
    for (let i = 0; i < body.zonesQuantities.length; i++) {
      total_quantity += body.zonesQuantities[i].quantity;
    }

    console.log({
      total_quantity,
    });

    // Create a new request entry for inbound products
    const requestInsert = await connection.execute<{
      requestId: number[];
    }>(
      `INSERT INTO request (quantity, productId, requestType, requestDate)
       VALUES (:quantity, :productId, 'in', SYSDATE)
       RETURNING id INTO :requestId`,
      {
        quantity: total_quantity,
        productId: productId,
        requestId: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
      },
      { autoCommit: false }
    );

    requestId = requestInsert.outBinds?.requestId[0];

    // Iterate over the array of zone quantities
    for (let i = 0; i < body.zonesQuantities.length; i++) {
      const zone_id = body.zonesQuantities[i].zone_id;
      const quantity = body.zonesQuantities[i].quantity;

      // Verify if the zone exists
      const zoneCheck = await connection.execute<[number]>(
        `SELECT COUNT(*) AS zone_exists FROM zone WHERE id = :zoneId`,
        {
          zoneId: zone_id,
        }
      );
      zone_exists = zoneCheck.rows?.[0][0];

      if (zone_exists === 0) {
        throw new Error(`Zone with ID ${zone_id} does not exist`);
      }

      // Verify if stock exists for the product and zone
      const stockCheck = await connection.execute<[number]>(
        `SELECT COUNT(*) AS stock_exists FROM stock WHERE productid = :productId AND zoneid = :zoneId`,
        { productId: productId, zoneId: zone_id }
      );
      stock_exists = stockCheck.rows?.[0][0];

      if (stock_exists === 0) {
        // Insert new stock entry if it doesn't exist
        await connection.execute(
          `INSERT INTO stock (quantity, zoneId, productId) VALUES (0, :zoneId, :productId)`,
          { zoneId: zone_id, productId: productId }
        );
      }

      // Retrieve the stock ID and quantity
      const stockInfo = await connection.execute<[number, number]>(
        `SELECT id, quantity FROM stock WHERE productId = :productId AND zoneId = :zoneId`,
        { productId: productId, zoneId: zone_id }
      );
      temporary_stock_id = stockInfo.rows?.[0][0];
      stock_quantity = stockInfo.rows?.[0][1];

      // Insert into productMovement
      await connection.execute(
        `INSERT INTO productMovement (stockId, oldQuantity, requestQuantity, requestId)
         VALUES (:stockId, :oldQuantity, :requestQuantity, :requestId)`,
        {
          stockId: temporary_stock_id,
          oldQuantity: stock_quantity,
          requestQuantity: quantity,
          requestId: requestId,
        }
      );
    }

    await connection.commit();

    const t2 = performance.now();

    return { executionTime: t2 - t1 };
  } catch (e) {
    await connection.rollback();
    throw e;
  } finally {
    await database.closeConnection(connection);
  }
};
