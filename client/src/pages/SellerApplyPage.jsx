import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Clock3, CheckCircle2, XCircle, ArrowRight, ShieldCheck, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { sellerService } from '../services/sellerService';
import Skeleton from '../components/ui/Skeleton';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

const initialForm = {
  storeName: '',
  businessEmail: '',
  description: '',
  phoneNumber: '',
  idType: '',
  idNumber: '',
  secondIdType: '',
  secondIdNumber: '',
};

const ID_TYPES = [
  "Driver's License",
  'Passport',
  'National ID',
  'UMID',
  'PhilHealth ID',
  'SSS ID',
  'Postal ID',
  "Voter's ID",
  'PRC ID',
  'TIN ID',
  'Digitized ID',
];

function SellerApplyPage() {
  const checked = useRequireAuth();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState({ idFront: null, idBack: null, secondIdFront: null, secondIdBack: null });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (!checked) return;

    const fetchApplication = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await sellerService.getMyApplication();
        setApplication(data.application);
        if (data.application) {
          setForm({
            storeName: data.application.storeName,
            businessEmail: data.application.businessEmail,
            description: data.application.description,
            phoneNumber: data.application.phoneNumber || '',
            idType: data.application.idType || '',
            idNumber: data.application.idNumber || '',
            secondIdType: data.application.secondIdType || '',
            secondIdNumber: data.application.secondIdNumber || '',
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load your application.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [checked]);

  if (!checked) return null;

  const isSeller = user?.role === 'seller';
  if (isSeller) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-3xl bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={36} />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">You are already a seller</h1>
        <p className="mt-2 text-slate-500">
          Your application was approved. Visit your seller dashboard to manage your store.
        </p>
        <Link to="/seller/dashboard" data-testid="go-to-dashboard" className="btn-primary mt-8">
          Open Seller Dashboard <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="mt-8 h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Alert type="error" message={error} />
      </div>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const FILE_SIZE_LIMIT = 5 * 1024 * 1024;
  const FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const validateFile = (file) => {
    if (!file) return 'This document is required.';
    if (!FILE_TYPES.includes(file.type)) return 'Only JPG, PNG, or WebP images are allowed.';
    if (file.size > FILE_SIZE_LIMIT) return 'File must be 5MB or smaller.';
    return '';
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.storeName.trim()) nextErrors.storeName = 'Store name is required.';
    else if (form.storeName.trim().length < 2) nextErrors.storeName = 'Store name must be at least 2 characters.';
    if (!form.businessEmail.trim()) nextErrors.businessEmail = 'Business email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.businessEmail)) nextErrors.businessEmail = 'Please enter a valid email address.';
    if (!form.description.trim()) nextErrors.description = 'Please tell us about your store.';
    else if (form.description.trim().length < 20) nextErrors.description = 'Description must be at least 20 characters.';
    if (!form.phoneNumber.trim()) nextErrors.phoneNumber = 'Phone number is required.';
    else if (!/^(\+63|0)\d{9,10}$/.test(form.phoneNumber.trim()))
      nextErrors.phoneNumber = 'Please enter a valid Philippine phone number (e.g. 09171234567).';
    if (!form.idType) nextErrors.idType = 'Please select a valid first ID type.';
    if (!form.idNumber.trim()) nextErrors.idNumber = 'First ID number is required.';
    else if (form.idNumber.trim().length < 3) nextErrors.idNumber = 'Please enter a valid ID number.';
    if (!form.secondIdType) nextErrors.secondIdType = 'Please select a valid second ID type.';
    if (!form.secondIdNumber.trim()) nextErrors.secondIdNumber = 'Second ID number is required.';
    else if (form.secondIdNumber.trim().length < 3) nextErrors.secondIdNumber = 'Please enter a valid ID number.';
    const fileChecks = {
      idFront: validateFile(files.idFront),
      idBack: validateFile(files.idBack),
      secondIdFront: validateFile(files.secondIdFront),
      secondIdBack: validateFile(files.secondIdBack),
    };
    Object.entries(fileChecks).forEach(([key, message]) => {
      if (message) nextErrors[key] = message;
    });
    return nextErrors;
  };

  const handleFileChange = (event) => {
    const { name, files: fileList } = event.target;
    const file = fileList[0] || null;
    setFiles((prev) => ({ ...prev, [name]: file }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setApiError('');

    if (Object.keys(nextErrors).length > 0) return;

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });

    setSubmitting(true);
    try {
      const data = await sellerService.apply(formData);
      setApplication(data.application);
      await refreshUser();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Could not submit your application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (application?.status === 'pending') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div
          data-testid="application-pending"
          className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft"
        >
          <div className="border-b border-slate-100 bg-amber-50 px-6 py-8 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-600">
              <Clock3 size={28} />
            </span>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">Application under review</h1>
            <p className="mt-2 text-sm text-slate-500">
              We&apos;re reviewing your application to become a seller. This usually takes 1–3 business days.
            </p>
          </div>
          <div className="px-6 py-6">
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Store name</dt>
                <dd className="font-semibold text-slate-900">{application.storeName}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Business email</dt>
                <dd className="font-semibold text-slate-900">{application.businessEmail}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Phone number</dt>
                <dd className="font-semibold text-slate-900">{application.phoneNumber}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Valid IDs</dt>
                <dd className="text-right font-semibold text-slate-900">
                  {application.idType} · {application.secondIdType}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Applied on</dt>
                <dd className="font-semibold text-slate-900">
                  {new Date(application.createdAt).toLocaleDateString('en-PH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900">Submitted ID photos</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {['idFrontUrl', 'idBackUrl'].map((key) => (
                  <a
                    key={key}
                    href={application[key]}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-xl border border-slate-200"
                  >
                    <img src={application[key]} alt={key} className="h-28 w-full object-cover" />
                    <p className="px-2 py-1.5 text-center text-[11px] font-medium text-slate-500">
                      {application.idType} {key === 'idFrontUrl' ? 'front' : 'back'}
                    </p>
                  </a>
                ))}
                {['secondIdFrontUrl', 'secondIdBackUrl'].map((key) => (
                  <a
                    key={key}
                    href={application[key]}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-xl border border-slate-200"
                  >
                    <img src={application[key]} alt={key} className="h-28 w-full object-cover" />
                    <p className="px-2 py-1.5 text-center text-[11px] font-medium text-slate-500">
                      {application.secondIdType} {key === 'secondIdFrontUrl' ? 'front' : 'back'}
                    </p>
                  </a>
                ))}
              </div>
            </div>
            <Link to="/products" data-testid="continue-shopping" className="btn-secondary mt-6 w-full">
              Back to shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (application?.status === 'rejected') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div
          data-testid="application-rejected"
          className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft"
        >
          <div className="border-b border-slate-100 bg-red-50 px-6 py-8 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-100 text-red-600">
              <XCircle size={28} />
            </span>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">Application not approved</h1>
            <p className="mt-2 text-sm text-slate-500">
              Unfortunately your seller application was not approved.
            </p>
          </div>
          <div className="px-6 py-6">
            {application.reviewNote ? (
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Reason</p>
                <p className="mt-0.5">{application.reviewNote}</p>
              </div>
            ) : (
              <Alert type="error" message="No further details were provided by the reviewer." />
            )}
            <button
              type="button"
              onClick={() => setApplication(null)}
              data-testid="reapply-button"
              className="btn-primary mt-6 w-full"
            >
              Apply again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Store size={28} />
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Become a Seller</h1>
        <p className="mt-2 text-slate-500">
          Tell us about your store. An admin will review your application and approve it.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <Alert type="error" message={apiError} />

        <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div>
            <label htmlFor="apply-storename" className="label-field">Store name</label>
            <input
              id="apply-storename"
              type="text"
              name="storeName"
              value={form.storeName}
              onChange={handleChange}
              placeholder="e.g. Manila Tech Store"
              data-testid="apply-storename"
              className="input-field"
            />
            {errors.storeName && <p className="mt-1 text-xs font-medium text-red-500">{errors.storeName}</p>}
          </div>

          <div className="mt-4">
            <label htmlFor="apply-email" className="label-field">Business email</label>
            <input
              id="apply-email"
              type="email"
              name="businessEmail"
              value={form.businessEmail}
              onChange={handleChange}
              placeholder="store@example.com"
              data-testid="apply-email"
              className="input-field"
            />
            {errors.businessEmail && <p className="mt-1 text-xs font-medium text-red-500">{errors.businessEmail}</p>}
          </div>

          <div className="mt-4">
            <label htmlFor="apply-description" className="label-field">About your store</label>
            <textarea
              id="apply-description"
              name="description"
              rows={5}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the products you plan to sell and why customers should shop with you. At least 20 characters."
              data-testid="apply-description"
              className="input-field resize-none"
            />
            {errors.description && <p className="mt-1 text-xs font-medium text-red-500">{errors.description}</p>}
          </div>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-100 text-blue-600">
                <ShieldCheck size={15} />
              </span>
              <h3 className="text-sm font-semibold text-blue-900">Identity verification</h3>
            </div>
            <p className="mt-1 text-xs text-blue-700">
              Provide a valid phone number and two (2) government-issued valid IDs for a more
              secure and trusted store.
            </p>
          </div>

          <div className="mt-4">
            <label htmlFor="apply-phone" className="label-field">Phone number</label>
            <input
              id="apply-phone"
              type="tel"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="09171234567"
              data-testid="apply-phone"
              className="input-field"
            />
            {errors.phoneNumber && <p className="mt-1 text-xs font-medium text-red-500">{errors.phoneNumber}</p>}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="apply-id-type" className="label-field">First valid ID type</label>
              <select
                id="apply-id-type"
                name="idType"
                value={form.idType}
                onChange={handleChange}
                data-testid="apply-id-type"
                className="input-field"
              >
                <option value="">Select ID type</option>
                {ID_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.idType && <p className="mt-1 text-xs font-medium text-red-500">{errors.idType}</p>}
            </div>
            <div>
              <label htmlFor="apply-id-number" className="label-field">First ID number</label>
              <input
                id="apply-id-number"
                type="text"
                name="idNumber"
                value={form.idNumber}
                onChange={handleChange}
                placeholder="ID number"
                data-testid="apply-id-number"
                className="input-field"
              />
              {errors.idNumber && <p className="mt-1 text-xs font-medium text-red-500">{errors.idNumber}</p>}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="apply-id-front" className="label-field">First ID front</label>
              <label
                htmlFor="apply-id-front"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 transition hover:border-primary hover:text-primary"
              >
                <Upload size={16} />
                {files.idFront ? files.idFront.name : 'Upload front photo'}
              </label>
              <input
                id="apply-id-front"
                type="file"
                name="idFront"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="sr-only"
                data-testid="apply-id-front"
              />
              {errors.idFront && <p className="mt-1 text-xs font-medium text-red-500">{errors.idFront}</p>}
            </div>
            <div>
              <label htmlFor="apply-id-back" className="label-field">First ID back</label>
              <label
                htmlFor="apply-id-back"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 transition hover:border-primary hover:text-primary"
              >
                <Upload size={16} />
                {files.idBack ? files.idBack.name : 'Upload back photo'}
              </label>
              <input
                id="apply-id-back"
                type="file"
                name="idBack"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="sr-only"
                data-testid="apply-id-back"
              />
              {errors.idBack && <p className="mt-1 text-xs font-medium text-red-500">{errors.idBack}</p>}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="apply-second-id-type" className="label-field">Second valid ID type</label>
              <select
                id="apply-second-id-type"
                name="secondIdType"
                value={form.secondIdType}
                onChange={handleChange}
                data-testid="apply-second-id-type"
                className="input-field"
              >
                <option value="">Select ID type</option>
                {ID_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.secondIdType && <p className="mt-1 text-xs font-medium text-red-500">{errors.secondIdType}</p>}
            </div>
            <div>
              <label htmlFor="apply-second-id-number" className="label-field">Second ID number</label>
              <input
                id="apply-second-id-number"
                type="text"
                name="secondIdNumber"
                value={form.secondIdNumber}
                onChange={handleChange}
                placeholder="ID number"
                data-testid="apply-second-id-number"
                className="input-field"
              />
              {errors.secondIdNumber && <p className="mt-1 text-xs font-medium text-red-500">{errors.secondIdNumber}</p>}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="apply-second-id-front" className="label-field">Second ID front</label>
              <label
                htmlFor="apply-second-id-front"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 transition hover:border-primary hover:text-primary"
              >
                <Upload size={16} />
                {files.secondIdFront ? files.secondIdFront.name : 'Upload front photo'}
              </label>
              <input
                id="apply-second-id-front"
                type="file"
                name="secondIdFront"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="sr-only"
                data-testid="apply-second-id-front"
              />
              {errors.secondIdFront && <p className="mt-1 text-xs font-medium text-red-500">{errors.secondIdFront}</p>}
            </div>
            <div>
              <label htmlFor="apply-second-id-back" className="label-field">Second ID back</label>
              <label
                htmlFor="apply-second-id-back"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 transition hover:border-primary hover:text-primary"
              >
                <Upload size={16} />
                {files.secondIdBack ? files.secondIdBack.name : 'Upload back photo'}
              </label>
              <input
                id="apply-second-id-back"
                type="file"
                name="secondIdBack"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="sr-only"
                data-testid="apply-second-id-back"
              />
              {errors.secondIdBack && <p className="mt-1 text-xs font-medium text-red-500">{errors.secondIdBack}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            data-testid="submit-application"
            className="btn-primary mt-6 w-full"
          >
            {submitting ? <Spinner label="Submitting..." /> : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SellerApplyPage;