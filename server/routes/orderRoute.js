import express from 'express';
import { getAllOrders, getUserOrders, placeOrderCOD, placeOrderStripe, cancelOrder, updateStatus } from '../controllers/order_Controller.js';
import authUser from '../middlewares/authUser.js';
import authSeller from '../middlewares/authSeller.js';

const orderRouter = express.Router();
orderRouter.post("/cod", authUser, placeOrderCOD);
orderRouter.get("/user", authUser, getUserOrders);
orderRouter.get("/seller", authSeller, getAllOrders);
orderRouter.post("/stripe", authUser, placeOrderStripe);
orderRouter.post("/cancel", authUser, cancelOrder);
orderRouter.post("/status", authSeller, updateStatus);

export default orderRouter;