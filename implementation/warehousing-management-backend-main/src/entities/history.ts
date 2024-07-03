export type HistorySummaryItem = {
  createdAt: Date;
  quantity: number;
  product: {
    id: number;
    name: string;
  };
  type: string;
};

export type HistoryDetailedItem = {
  createdAt: Date;
  type: string;
  quantity: number;
  product: {
    id: number;
    name: string;
  };
  zone: {
    id: number;
    name: string;
  };
};
