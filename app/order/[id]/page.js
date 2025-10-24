// src/app/order/[id]/page.jsx
import OrderDetails from "@/app/components/OrderDetails";

export default function OrderPage({ params }) {
  return <OrderDetails orderId={params.id} />;
}
