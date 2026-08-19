import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, Upload, Trash2, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { productReviewService } from '../services/storeService';
import ReportButton from './ReportModal';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

function StarRating({ value, interactive = false, onSelect, onHover, onLeave, size = 28 }) {
  return (
    <div className="flex items-center gap-1" onMouseLeave={interactive ? onLeave : undefined}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={interactive ? () => onSelect(star) : undefined}
            onMouseEnter={interactive ? () => onHover(star) : undefined}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            className={interactive ? 'p-0.5' : 'pointer-events-none'}
          >
            <Star
              size={size}
              fill={active ? 'currentColor' : 'none'}
              className={active ? 'text-amber-400' : 'text-slate-300'}
            />
          </button>
        );
      })}
    </div>
  );
}

function ProductReviews({ productId }) {
  const { user } = useAuth();
  const isCustomer = user?.role === 'customer';

  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const reload = async () => {
    const data = await productReviewService.getReviews(productId);
    setSummary({ rating: data.rating, reviewCount: data.reviewCount });
    setReviews(data.reviews);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        await reload();
        if (isCustomer) {
          try {
            const mine = await productReviewService.getMyReview(productId);
            if (mine.review) {
              setMyReview(mine.review);
              setRating(mine.review.rating);
              setComment(mine.review.comment);
            }
          } catch {
            // ignore
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load reviews.');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, isCustomer]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!rating) nextErrors.rating = 'Please select a star rating.';
    if (!comment.trim()) nextErrors.comment = 'Please write a short review.';
    else if (comment.trim().length < 3) nextErrors.comment = 'Review must be at least 3 characters.';
    if (image && !['image/jpeg', 'image/png', 'image/webp'].includes(image.type))
      nextErrors.image = 'Only JPG, PNG, or WebP images are allowed.';
    if (image && image.size > 5 * 1024 * 1024) nextErrors.image = 'Photo must be 5MB or smaller.';
    setFormErrors(nextErrors);
    setApiError('');
    if (Object.keys(nextErrors).length > 0) return;

    const formData = new FormData();
    formData.append('rating', String(rating));
    formData.append('comment', comment.trim());
    if (image) formData.append('image', image);

    setSubmitting(true);
    try {
      const data = await productReviewService.submitReview(productId, formData);
      setMyReview(data.review);
      await reload();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Could not submit your review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    setApiError('');
    try {
      await productReviewService.deleteReview(productId);
      setMyReview(null);
      setRating(0);
      setComment('');
      setImage(null);
      await reload();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Could not delete your review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="product-reviews" className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <MessageSquare size={20} className="text-primary" /> Customer reviews
            {summary?.reviewCount > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-sm font-semibold text-amber-600">
                <Star size={13} fill="currentColor" />
                {summary.rating.toFixed(1)}
                <span className="font-normal text-amber-500">({summary.reviewCount})</span>
              </span>
            )}
          </h2>

          {loading ? (
            <p className="mt-4 text-sm text-slate-400">Loading reviews...</p>
          ) : error ? (
            <div className="mt-4"><Alert type="error" message={error} /></div>
          ) : reviews.length === 0 ? (
            <div
              data-testid="no-reviews"
              className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center"
            >
              <p className="font-semibold text-slate-700">No reviews yet</p>
              <p className="mt-1 text-sm text-slate-500">Be the first to review this product.</p>
            </div>
          ) : (
            <ul data-testid="review-list" className="mt-4 space-y-4">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">
                      {review.user.firstName} {review.user.lastName}
                    </p>
                    <div className="flex items-center gap-2">
                      <StarRating value={review.rating} size={14} />
                      <ReportButton targetType="review" target={review} />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {review.imageUrl && (
                    <img
                      src={review.imageUrl}
                      alt="Review"
                      className="mt-3 h-40 w-full rounded-xl object-cover sm:w-72"
                    />
                  )}
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{review.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
            {isCustomer ? (
              <>
                <h3 className="text-lg font-bold text-slate-900">
                  {myReview ? 'Update your review' : 'Write a review'}
                </h3>
                {apiError && <div className="mt-3"><Alert type="error" message={apiError} /></div>}
                <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
                  <div>
                    <span className="mb-1 block text-sm font-medium text-slate-700">Your rating</span>
                    <StarRating
                      value={hoverRating || rating}
                      interactive
                      onSelect={setRating}
                      onHover={setHoverRating}
                      onLeave={() => setHoverRating(0)}
                    />
                    {formErrors.rating && (
                      <p className="mt-1 text-xs font-medium text-red-500">{formErrors.rating}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="review-comment" className="label-field">Comment</label>
                    <textarea
                      id="review-comment"
                      name="comment"
                      rows={4}
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      placeholder="How was this product?"
                      data-testid="review-comment"
                      className="input-field resize-none"
                    />
                    {formErrors.comment && (
                      <p className="mt-1 text-xs font-medium text-red-500">{formErrors.comment}</p>
                    )}
                  </div>

                  <div>
                    <span className="mb-1 block text-sm font-medium text-slate-700">
                      Photo (optional)
                    </span>
                    {image ? (
                      <div className="overflow-hidden rounded-xl border border-slate-200">
                        <img
                          src={URL.createObjectURL(image)}
                          alt="Preview"
                          className="h-36 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setImage(null)}
                          className="flex w-full items-center justify-center gap-1.5 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red-600"
                        >
                          <X size={14} /> Remove photo
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="review-image"
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-500 transition hover:border-primary hover:text-primary"
                      >
                        <Upload size={16} /> Upload a photo
                      </label>
                    )}
                    <input
                      id="review-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => setImage(event.target.files[0] || null)}
                      className="sr-only"
                    />
                    {formErrors.image && (
                      <p className="mt-1 text-xs font-medium text-red-500">{formErrors.image}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      data-testid="submit-review"
                      className="btn-primary flex-1"
                    >
                      {submitting ? (
                        <Spinner label="Saving..." />
                      ) : myReview ? (
                        <>
                          <Check size={16} /> Update review
                        </>
                      ) : (
                        'Submit review'
                      )}
                    </button>
                    {myReview && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={submitting}
                        aria-label="Delete your review"
                        className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </form>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Log in
                </Link>{' '}
                as a customer to rate and review this product.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductReviews;