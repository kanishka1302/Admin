import Order from "../models/orderModel.js";

export const generateOrderId = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

  const count = await Order.countDocuments({
    createdAt: {
      $gte: new Date(today.setHours(0, 0, 0, 0)),
      $lte: new Date(today.setHours(23, 59, 59, 999)),
    },
  });

  const number = (count + 1).toString().padStart(3, '0');
  return `NV${dateStr}${number}`;
};
