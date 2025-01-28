import React from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";

const OrderSummary = ({ order }) => (
  <div className="bg-gray-50 p-6 rounded-lg">
    {order ? (
      <>
        {order.items.map((item, index) => (
          <div key={item.product_id || index} className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <img
                src={item.image_link || "/assets/images/default.png"}
                alt={item.name || "Unknown item"}
                className="w-16 h-16 object-cover rounded-md"
              />
              <span className="absolute -top-2 -right-2 bg-green-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs">
                {item.quantity || 0}
              </span>
            </div>
            <div>
              <h3 className="font-medium">{item.name || "Unknown Item"}</h3>
              <p className="text-green-600">${Number(item.price || 0)}</p>
            </div>
          </div>
        ))}
        <div className="space-y-3">
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <span className="font-medium">Total</span>
            <span className="text-green-600">${Number(order.total_price || 0)}</span>
          </div>
        </div>
      </>
    ) : (
      <p className="text-gray-600">No order details available.</p>
    )}
  </div>
);

const ThankYouPage = () => {
  const location = useLocation();
  const order = location.state?.order;
  console.log(order)
  const handleGenerateAndStoreReceipt = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      console.log(order)
      // Call backend to generate, store, and save metadata for the receipt
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/generate-receipt`,
        { order },
        {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        }
      );
  
      if (response.data && response.data.receipt_url) {
        const receipt_url = response.data.receipt_url;
        console.log(`Public receipt URL: ${receipt_url}`);
  
        const viewerHtml = `
          <html>
            <body style="margin:0;overflow:hidden">
              <iframe src="${receipt_url}" style="border:none;width:100%;height:100%"></iframe>
            </body>
          </html>
        `;
        const viewerBlob = new Blob([viewerHtml], { type: "text/html" });
        const viewerUrl = URL.createObjectURL(viewerBlob);
        window.open(viewerUrl, "_blank");

        // Allow the user to download the receipt
        /*
        const link = document.createElement("a");
        link.href = receipt_url;
        link.setAttribute("download", `receipt_${order.orderId}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        */
        // Automatically email the receipt
        const emailResponse = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/send-receipt`,
          {
            order,
            recipient_email: order.email,
            subject: "Your Order Receipt",
            content: "<p>Thank you for your order! Your receipt is attached.</p>",
          },
          {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          }
        );
  
      } else {
        throw new Error("Receipt URL is not available in the response.");
      }
    } catch (error) {
      console.error("Error generating or storing receipt:", error);
      alert("Failed to process receipt. Please try again later.");
    }
  };
  
  

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link to="/cart" className="text-gray-500">Cart</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900">Payment</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 mb-6">
              <CheckCircle className="w-full h-full text-green-500" />
            </div>

            <h1 className="text-2xl font-medium mb-2">Payment Confirmed</h1>
            <p className="text-green-600 text-sm mb-4">
              ORDER #{order ? order.order_number || "N/A" : "Loading..."}
            </p>

            <p className="text-gray-600 mb-6 max-w-md">
              Thank you for your payment. The nature is grateful to you. Now that your 
              order is confirmed it will be ready to ship in 2 days. Please check your inbox 
              in the future for your order updates.
            </p>

            <div className="space-y-3">
              <Link
                to="/products"
                className="block bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Back to shopping
              </Link>

              <button
                onClick={handleGenerateAndStoreReceipt}
                className="text-green-600 hover:text-green-700"
              >
                View & Email Receipt
              </button>
            </div>
          </div>

          <OrderSummary order={order} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ThankYouPage;
