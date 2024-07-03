import OracleDB from "oracledb";
import { database } from "../database/connection";

export const createInboundRequest = async (
  productId: string,
  body: {
    zonesQuantities: { zone_id: number; quantity: number }[];
  }
): Promise<{
  executionTime: number;
}> => {
  const t1 = performance.now();

  const connection = await database.getConnection();

  const bindZonesQuantities = `
    zonesQuantities_input zone_quantity_list := zone_quantity_list(
      ${body.zonesQuantities
        .map(
          (zoneQuantity) =>
            `zone_quantity_type(${zoneQuantity.zone_id}, ${zoneQuantity.quantity})`
        )
        .join(", ")}
    );
  `;

  const result = await connection.execute(
    `DECLARE ${bindZonesQuantities} BEGIN product_inbound(:productId, zonesQuantities_input); END;`,
    {
      productId: productId,
    }
  );

  await database.commit(connection);

  await database.closeConnection(connection);

  const t2 = performance.now();

  return { executionTime: t2 - t1 };
};
