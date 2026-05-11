export default function OrderSummary({ cartItems, itemsPrice, shippingPrice, gstBreakdown, discount, total }) {
  return (
    <div className="bg-ivory p-6 rounded-md shadow-sm border border-sand/20">
      <h3 className="font-display text-xl text-kashish mb-4 border-b border-sand/20 pb-2">Order Summary</h3>
      
      <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
        {cartItems.map((item, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <div>
              <p className="text-kashish font-medium line-clamp-1">{item.name || item.product?.name}</p>
              <p className="text-sand text-xs">Size: {item.size} | Qty: {item.quantity}</p>
            </div>
            <p className="font-semibold">₹{item.price * item.quantity}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2 text-sm text-kashish border-t border-sand/20 pt-4">
        <div className="flex justify-between"><span>Subtotal</span><span>₹{itemsPrice}</span></div>
        <div className="flex justify-between"><span>Shipping</span><span>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span></div>
        <div className="flex justify-between text-xs text-sand"><span>CGST</span><span>₹{gstBreakdown.cgst}</span></div>
        <div className="flex justify-between text-xs text-sand"><span>SGST</span><span>₹{gstBreakdown.sgst}</span></div>
        {discount > 0 && <div className="flex justify-between text-terracotta font-medium"><span>Discount</span><span>-₹{discount}</span></div>}
      </div>

      <div className="flex justify-between items-center text-lg font-display text-kashish border-t border-sand/30 pt-4 mt-4">
        <span>Total</span>
        <span className="font-bold text-terracotta">₹{total}</span>
      </div>
    </div>
  );
}
