import "express-async-errors";

import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import { getProviders } from "./handlers/get-providers";
import { createProvider } from "./handlers/create-provider";
import { getProducts } from "./handlers/get-products";
import { createProduct } from "./handlers/create-product";
import { getProductSummaryHistory } from "./handlers/get-product-summary-history";
import { createInboundRequest } from "./handlers/create-inbound-request";
import { createOutboundRequest } from "./handlers/create-outbound-request";
import { getZones } from "./handlers/get-zones";
import { createZone } from "./handlers/create-zone";
import { getProductDetailedHistory } from "./handlers/get-product-detailed-history";
import { createInboundRequestAppLicationLayer } from "./handlers/create-inbound-request-application-layer";

const PORT = 5000;

const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/providers", async (req, res) => {
  const providers = await getProviders();

  res.send({
    providers: providers,
  });
});

app.post("/providers", async (req, res) => {
  await createProvider(req.body);

  res.sendStatus(201);
});

app.get("/products", async (req, res) => {
  const products = await getProducts();

  res.send({
    products: products,
  });
});

app.post("/products", async (req, res) => {
  await createProduct(req.body);

  res.sendStatus(201);
});

app.get("/products/:id/history/detailed", async (req, res) => {
  const history = await getProductDetailedHistory(req.params.id);

  res.send({
    history: history,
  });
});

app.get("/products/:id/history/summary", async (req, res) => {
  const history = await getProductSummaryHistory(req.params.id);

  res.send({
    history: history,
  });
});

app.post("/products/:id/inbound", async (req, res) => {
  const response = await createInboundRequest(req.params.id, req.body);

  res.send(response);
});

app.post("/products/:id/inbound/application", async (req, res) => {
  const response = await createInboundRequestAppLicationLayer(
    req.params.id,
    req.body
  );

  res.send(response);
});

app.post("/products/:id/outbound", async (req, res) => {
  const result = await createOutboundRequest(req.params.id, req.body);

  res.send(result);
});

app.get("/zones", async (req, res) => {
  const zones = await getZones();

  res.send({
    zones: zones,
  });
});

app.post("/zones", async (req, res) => {
  await createZone(req.body);

  res.sendStatus(201);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).send({
    message: err.message || "Something went wrong",
  });
});

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
