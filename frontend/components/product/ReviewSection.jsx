'use client';
import { Star } from 'lucide-react';

export default function ReviewSection({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return <p className="text-sand text-sm">No reviews yet. Be the first to review this product!</p>;
  }

  return (
    <div className="space-y-6">
      <h3 className="font-display text-2xl text-kashish border-b border-sand/20 pb-2">Customer Reviews</h3>
      {reviews.map((review, i) => (
        <div key={i} className="border-b border-sand/10 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-terracotta">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star key={idx} size={14} className={idx < review.rating ? 'fill-terracotta' : 'text-sand'} />
              ))}
            </div>
            <span className="font-body font-semibold text-sm text-kashish">{review.title}</span>
          </div>
          <p className="text-sm text-kashish/80 mb-2">{review.comment}</p>
          <div className="flex items-center gap-2 text-xs text-sand">
            <span>{review.user?.name || 'Verified Customer'}</span>
            {review.isVerifiedPurchase && <span className="bg-cream px-2 py-0.5 rounded text-[10px] text-terracotta">Verified Purchase</span>}
            <span>• {new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
