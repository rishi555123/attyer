export default function AdminCoupons() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-3xl text-kashish">Coupons</h1>
        <button className="bg-kashish text-ivory px-4 py-2 text-sm rounded hover:bg-terracotta">Create Coupon</button>
      </div>
      <div className="bg-white rounded border border-sand/30 p-8 text-center text-sand">
        No coupons configured yet.
      </div>
    </div>
  );
}
