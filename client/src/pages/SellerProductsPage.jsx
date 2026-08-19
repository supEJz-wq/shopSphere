import { useEffect, useState } from 'react';
import { Package, Plus, Upload, PackageX, Pencil, Trash2, X, AlertTriangle, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { sellerService } from '../services/sellerService';
import { formatPrice } from '../utils/formatPrice';
import Skeleton from '../components/ui/Skeleton';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

const emptyProductForm = {
  name: '',
  description: '',
  category: '',
  price: '',
  stock: '',
  image: '',
};

const MAX_IMAGES = 5;

function SellerProductsPage() {
  const checked = useRequireAuth();
  const { refreshUser } = useAuth();

  const [tab, setTab] = useState('manage');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [addForm, setAddForm] = useState(emptyProductForm);
  const [addErrors, setAddErrors] = useState({});
  const [addImageFiles, setAddImageFiles] = useState([]);
  const [addImagePreviews, setAddImagePreviews] = useState([]);
  const [adding, setAdding] = useState(false);
  const [addApiError, setAddApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState(emptyProductForm);
  const [editErrors, setEditErrors] = useState({});
  const [editImageFiles, setEditImageFiles] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editApiError, setEditApiError] = useState('');

  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [appealFor, setAppealFor] = useState(null);
  const [appealReason, setAppealReason] = useState('');
  const [appealImageFile, setAppealImageFile] = useState(null);
  const [appealImagePreview, setAppealImagePreview] = useState('');
  const [appealError, setAppealError] = useState('');
  const [appealBusy, setAppealBusy] = useState(false);

  const fetchProducts = async () => {
    const data = await sellerService.getProducts();
    setProducts(data.products);
  };

  useEffect(() => {
    if (!checked) return;

    const init = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        await refreshUser();
        await fetchProducts();
      } catch (err) {
        if (err.response?.status === 403) {
          setLoadError(err.response?.data?.message || 'Your shop has been banned.');
          return;
        }
        setLoadError(err.response?.data?.message || 'Could not load your products.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [checked, refreshUser]);

  const handleAddChange = (event) => {
    const { name, value } = event.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
    setAddErrors((prev) => ({ ...prev, [name]: '' }));
    setAddApiError('');
    setSuccessMessage('');
  };

  const handleAddImageChange = (event) => {
    const files = Array.from(event.target.files || []);
    const remaining = MAX_IMAGES - addImageFiles.length;
    if (files.length > remaining) {
      setAddErrors((prev) => ({ ...prev, image: `You can add up to ${MAX_IMAGES} images. ${remaining} more allowed.` }));
      return;
    }
    const invalid = files.find((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type));
    if (invalid) {
      setAddErrors((prev) => ({ ...prev, image: 'Only JPG, PNG, or WebP images are allowed.' }));
      return;
    }
    setAddErrors((prev) => ({ ...prev, image: '' }));
    setAddApiError('');
    setSuccessMessage('');
    const nextFiles = [...addImageFiles, ...files];
    setAddImageFiles(nextFiles);
    setAddImagePreviews(nextFiles.map((file) => URL.createObjectURL(file)));
  };

  const handleRemoveAddImage = (index) => {
    setAddImageFiles((prev) => prev.filter((_, i) => i !== index));
    setAddImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setAddErrors((prev) => ({ ...prev, image: '' }));
  };

  const validateAddForm = () => {
    const nextErrors = {};
    if (!addForm.name.trim()) nextErrors.name = 'Product name is required.';
    if (!addForm.description.trim()) nextErrors.description = 'Description is required.';
    else if (addForm.description.trim().length < 10) nextErrors.description = 'Description must be at least 10 characters.';
    if (!addForm.category.trim()) nextErrors.category = 'Category is required.';
    if (!addForm.price) nextErrors.price = 'Price is required.';
    else if (Number(addForm.price) <= 0) nextErrors.price = 'Price must be greater than zero.';
    if (addForm.stock === '') nextErrors.stock = 'Stock is required.';
    else if (Number(addForm.stock) < 0) nextErrors.stock = 'Stock cannot be negative.';
    if (addImageFiles.length === 0 && !addForm.image.trim()) nextErrors.image = 'Add at least one image or provide an image URL.';
    return nextErrors;
  };

  const handleAddSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateAddForm();
    setAddErrors(nextErrors);
    setAddApiError('');
    setSuccessMessage('');

    if (Object.keys(nextErrors).length > 0) return;

    setAdding(true);
    try {
      await sellerService.createProduct(
        {
          name: addForm.name.trim(),
          description: addForm.description.trim(),
          category: addForm.category.trim(),
          price: Number(addForm.price),
          stock: Number(addForm.stock),
          image: addForm.image.trim(),
        },
        addImageFiles
      );
      setAddForm(emptyProductForm);
      setAddImageFiles([]);
      setAddImagePreviews([]);
      setSuccessMessage('Product added successfully!');
      await fetchProducts();
      setTab('manage');
    } catch (err) {
      setAddApiError(err.response?.data?.message || 'Could not add this product.');
    } finally {
      setAdding(false);
    }
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      image: product.image || '',
    });
    setEditErrors({});
    setEditImageFiles([]);
    setEditImagePreviews([]);
    setEditApiError('');
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setEditErrors((prev) => ({ ...prev, [name]: '' }));
    setEditApiError('');
  };

  const handleEditImageChange = (event) => {
    const files = Array.from(event.target.files || []);
    const remaining = MAX_IMAGES - editImageFiles.length;
    if (files.length > remaining) {
      setEditErrors((prev) => ({ ...prev, image: `You can add up to ${MAX_IMAGES} images. ${remaining} more allowed.` }));
      return;
    }
    const invalid = files.find((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type));
    if (invalid) {
      setEditErrors((prev) => ({ ...prev, image: 'Only JPG, PNG, or WebP images are allowed.' }));
      return;
    }
    setEditErrors((prev) => ({ ...prev, image: '' }));
    setEditApiError('');
    const nextFiles = [...editImageFiles, ...files];
    setEditImageFiles(nextFiles);
    setEditImagePreviews(nextFiles.map((file) => URL.createObjectURL(file)));
  };

  const handleRemoveEditImage = (index) => {
    setEditImageFiles((prev) => prev.filter((_, i) => i !== index));
    setEditImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setEditErrors((prev) => ({ ...prev, image: '' }));
  };

  const validateEditForm = () => {
    const nextErrors = {};
    if (!editForm.name.trim()) nextErrors.name = 'Product name is required.';
    if (!editForm.description.trim()) nextErrors.description = 'Description is required.';
    else if (editForm.description.trim().length < 10) nextErrors.description = 'Description must be at least 10 characters.';
    if (!editForm.category.trim()) nextErrors.category = 'Category is required.';
    if (!editForm.price) nextErrors.price = 'Price is required.';
    else if (Number(editForm.price) <= 0) nextErrors.price = 'Price must be greater than zero.';
    if (editForm.stock === '') nextErrors.stock = 'Stock is required.';
    else if (Number(editForm.stock) < 0) nextErrors.stock = 'Stock cannot be negative.';
    if (editImageFiles.length === 0 && !editForm.image.trim()) nextErrors.image = 'Add at least one image or provide an image URL.';
    return nextErrors;
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateEditForm();
    setEditErrors(nextErrors);
    setEditApiError('');

    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await sellerService.updateProduct(
        editingProduct.id,
        {
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          category: editForm.category.trim(),
          price: Number(editForm.price),
          stock: Number(editForm.stock),
          image: editForm.image.trim(),
        },
        editImageFiles
      );
      setEditingProduct(null);
      setSuccessMessage('Product updated successfully!');
      await fetchProducts();
    } catch (err) {
      setEditApiError(err.response?.data?.message || 'Could not update this product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await sellerService.deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
      setSuccessMessage('Product deleted.');
      await fetchProducts();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Could not delete this product.');
    } finally {
      setDeleting(false);
    }
  };

  const openAppeal = (product) => {
    setAppealFor(product);
    setAppealReason('');
    setAppealImageFile(null);
    setAppealImagePreview('');
    setAppealError('');
  };

  const handleAppealImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setAppealError('Only JPG, PNG, or WebP images are allowed.');
      return;
    }
    setAppealError('');
    setAppealImageFile(file);
    setAppealImagePreview(URL.createObjectURL(file));
  };

  const handleAppealSubmit = async (event) => {
    event.preventDefault();
    if (!appealFor) return;
    setAppealBusy(true);
    setAppealError('');
    try {
      await sellerService.createAppeal('product', appealFor.id, appealReason, appealImageFile);
      setAppealFor(null);
      setSuccessMessage('Your appeal has been submitted. An admin will review it.');
      await fetchProducts();
    } catch (err) {
      setAppealError(err.response?.data?.message || 'Could not submit your appeal.');
    } finally {
      setAppealBusy(false);
    }
  };

  if (!checked) return null;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <div className="mt-6 flex gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        <Skeleton className="mt-8 h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Alert type="error" message={loadError} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
            <Store size={28} />
            Products
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Add, edit, and remove products from your store catalog.
          </p>
        </div>
      </div>

      {successMessage && <div className="mt-6"><Alert type="success" message={successMessage} /></div>}
      {addApiError && tab === 'add' && <div className="mt-6"><Alert type="error" message={addApiError} /></div>}

      <div className="mt-6 flex gap-2">
        {[
          { key: 'manage', label: 'My products' },
          { key: 'add', label: 'Add product' },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setTab(item.key);
              setSuccessMessage('');
            }}
            data-testid={`tab-${item.key}`}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === item.key
                ? 'bg-primary text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'manage' && (
        <section className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Package size={16} />
            </span>
            <h2 className="text-lg font-semibold text-slate-900">My products ({products.length})</h2>
          </div>

          <div data-testid="seller-products" className="mt-5">
            {products.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                  <PackageX size={26} />
                </span>
                <p className="mt-4 font-semibold text-slate-900">No products yet</p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Add your first product using the Add product tab above.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {products.map((product) => (
                  <li key={product.id} data-testid="seller-product" className="flex flex-wrap items-center gap-4 py-4">
                    <img src={product.image} alt={product.name} className="h-14 w-14 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      <p className="text-sm text-slate-500">
                        {product.category}
                        {product.status === 'banned' && (
                          <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                            Banned
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatPrice(product.price)}</p>
                      <p className="text-sm text-slate-500">{product.stock} in stock</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        data-testid={`edit-product-${product.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      {product.status === 'banned' && (
                        <button
                          type="button"
                          onClick={() => openAppeal(product)}
                          data-testid={`appeal-product-${product.id}`}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                        >
                          Appeal
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setDeletingProduct(product);
                          setDeleteError('');
                        }}
                        data-testid={`delete-product-${product.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {tab === 'add' && (
        <section className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <Plus size={16} />
            </span>
            <h2 className="text-lg font-semibold text-slate-900">Add product</h2>
          </div>

          <form onSubmit={handleAddSubmit} noValidate className="mt-5 max-w-2xl space-y-4">
            <div>
              <label htmlFor="new-product-name" className="label-field">Name</label>
              <input
                id="new-product-name"
                type="text"
                name="name"
                value={addForm.name}
                onChange={handleAddChange}
                placeholder="Wireless Charger"
                data-testid="new-product-name"
                className="input-field"
              />
              {addErrors.name && <p className="mt-1 text-xs font-medium text-red-500">{addErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="new-product-category" className="label-field">Category</label>
              <input
                id="new-product-category"
                type="text"
                name="category"
                list="product-categories"
                value={addForm.category}
                onChange={handleAddChange}
                placeholder="Select or type a category"
                data-testid="new-product-category"
                className="input-field"
              />
              <datalist id="product-categories">
                <option value="Laptop" />
                <option value="Smartphone" />
                <option value="Headphones" />
                <option value="Accessories" />
              </datalist>
              {addErrors.category && <p className="mt-1 text-xs font-medium text-red-500">{addErrors.category}</p>}
            </div>

            <div>
              <label htmlFor="new-product-description" className="label-field">Description</label>
              <textarea
                id="new-product-description"
                name="description"
                rows={3}
                value={addForm.description}
                onChange={handleAddChange}
                placeholder="Product description"
                data-testid="new-product-description"
                className="input-field resize-none"
              />
              {addErrors.description && <p className="mt-1 text-xs font-medium text-red-500">{addErrors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="new-product-price" className="label-field">Price (₱)</label>
                <input
                  id="new-product-price"
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={addForm.price}
                  onChange={handleAddChange}
                  placeholder="0.00"
                  data-testid="new-product-price"
                  className="input-field"
                />
                {addErrors.price && <p className="mt-1 text-xs font-medium text-red-500">{addErrors.price}</p>}
              </div>
              <div>
                <label htmlFor="new-product-stock" className="label-field">Stock</label>
                <input
                  id="new-product-stock"
                  type="number"
                  name="stock"
                  min="0"
                  value={addForm.stock}
                  onChange={handleAddChange}
                  placeholder="10"
                  data-testid="new-product-stock"
                  className="input-field"
                />
                {addErrors.stock && <p className="mt-1 text-xs font-medium text-red-500">{addErrors.stock}</p>}
              </div>
            </div>

            <div>
              <label className="label-field">Product images</label>
              <div className="flex flex-wrap items-center gap-3">
                {addImagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img src={preview} alt={`Product ${index + 1}`} className="h-14 w-14 rounded-xl object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveAddImage(index)}
                      data-testid={`remove-product-image-${index}`}
                      className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-xs font-bold text-white"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {addImageFiles.length < MAX_IMAGES && (
                  <label
                    htmlFor="new-product-image-file"
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-primary hover:text-primary"
                  >
                    <Upload size={16} />
                    {addImageFiles.length === 0 ? 'Upload images' : `Add image (${addImageFiles.length}/${MAX_IMAGES})`}
                    <input
                      id="new-product-image-file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleAddImageChange}
                      data-testid="new-product-image-file"
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Up to 5 images, JPG/PNG/WebP each up to 5MB. Or paste an image URL below.
              </p>
              <input
                id="new-product-image"
                type="url"
                name="image"
                value={addForm.image}
                onChange={handleAddChange}
                placeholder="https://... (optional if images uploaded)"
                data-testid="new-product-image"
                className="input-field mt-2"
              />
              {addErrors.image && <p className="mt-1 text-xs font-medium text-red-500">{addErrors.image}</p>}
            </div>

            <button type="submit" disabled={adding} data-testid="add-product-submit" className="btn-primary w-full">
              {adding ? <Spinner label="Adding..." /> : 'Add Product'}
            </button>
          </form>
        </section>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form onSubmit={handleEditSubmit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Edit product</h2>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">Update the details of this product.</p>
            {editApiError && <div className="mt-3"><Alert type="error" message={editApiError} /></div>}

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="edit-product-name" className="label-field">Name</label>
                <input
                  id="edit-product-name"
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  data-testid="edit-product-name"
                  className="input-field"
                />
                {editErrors.name && <p className="mt-1 text-xs font-medium text-red-500">{editErrors.name}</p>}
              </div>

              <div>
                <label htmlFor="edit-product-category" className="label-field">Category</label>
                <input
                  id="edit-product-category"
                  type="text"
                  name="category"
                  list="product-categories"
                  value={editForm.category}
                  onChange={handleEditChange}
                  data-testid="edit-product-category"
                  className="input-field"
                />
                {editErrors.category && <p className="mt-1 text-xs font-medium text-red-500">{editErrors.category}</p>}
              </div>

              <div>
                <label htmlFor="edit-product-description" className="label-field">Description</label>
                <textarea
                  id="edit-product-description"
                  name="description"
                  rows={3}
                  value={editForm.description}
                  onChange={handleEditChange}
                  data-testid="edit-product-description"
                  className="input-field resize-none"
                />
                {editErrors.description && <p className="mt-1 text-xs font-medium text-red-500">{editErrors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-product-price" className="label-field">Price (₱)</label>
                  <input
                    id="edit-product-price"
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={editForm.price}
                    onChange={handleEditChange}
                    data-testid="edit-product-price"
                    className="input-field"
                  />
                  {editErrors.price && <p className="mt-1 text-xs font-medium text-red-500">{editErrors.price}</p>}
                </div>
                <div>
                  <label htmlFor="edit-product-stock" className="label-field">Stock</label>
                  <input
                    id="edit-product-stock"
                    type="number"
                    name="stock"
                    min="0"
                    value={editForm.stock}
                    onChange={handleEditChange}
                    data-testid="edit-product-stock"
                    className="input-field"
                  />
                  {editErrors.stock && <p className="mt-1 text-xs font-medium text-red-500">{editErrors.stock}</p>}
                </div>
              </div>

              <div>
                <label className="label-field">Product images</label>
                <div className="flex flex-wrap items-center gap-3">
                  {editImagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img src={preview} alt={`Product ${index + 1}`} className="h-14 w-14 rounded-xl object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveEditImage(index)}
                        className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-xs font-bold text-white"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {editImageFiles.length < MAX_IMAGES && (
                    <label
                      htmlFor="edit-product-image-file"
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-primary hover:text-primary"
                    >
                      <Upload size={16} />
                      {editImageFiles.length === 0 ? 'Upload images' : `Add image (${editImageFiles.length}/${MAX_IMAGES})`}
                      <input
                        id="edit-product-image-file"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleEditImageChange}
                        data-testid="edit-product-image-file"
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <input
                  id="edit-product-image"
                  type="url"
                  name="image"
                  value={editForm.image}
                  onChange={handleEditChange}
                  placeholder="https://... (optional if images uploaded)"
                  data-testid="edit-product-image"
                  className="input-field mt-2"
                />
                {editErrors.image && <p className="mt-1 text-xs font-medium text-red-500">{editErrors.image}</p>}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setEditingProduct(null)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={saving} data-testid="save-product" className="btn-primary">
                {saving ? <Spinner label="Saving..." /> : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-100 text-red-600">
                <AlertTriangle size={22} />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Delete product?</h2>
                <p className="mt-1 text-sm text-slate-500">
                  This will permanently remove "{deletingProduct.name}" and cannot be undone.
                </p>
              </div>
            </div>
            {deleteError && <div className="mt-3"><Alert type="error" message={deleteError} /></div>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setDeletingProduct(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                data-testid="confirm-delete-product"
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                {deleting ? <Spinner label="Deleting..." /> : 'Delete product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {appealFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form onSubmit={handleAppealSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Appeal ban</h2>
              <button
                type="button"
                onClick={() => setAppealFor(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              "{appealFor.name}" is banned. Explain why it should be restored.
            </p>
            {appealError && <div className="mt-3"><Alert type="error" message={appealError} /></div>}
            <textarea
              value={appealReason}
              onChange={(e) => setAppealReason(e.target.value)}
              rows={4}
              placeholder="Explain your situation and why the ban should be lifted..."
              data-testid="appeal-reason"
              className="input-field mt-4 resize-none"
              required
              minLength={10}
            />
            <div className="mt-3">
              <label
                htmlFor="appeal-proof-image"
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-primary hover:text-primary"
              >
                <Upload size={16} />
                {appealImagePreview ? 'Change proof photo' : 'Upload proof photo (optional)'}
                <input
                  id="appeal-proof-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAppealImageChange}
                  data-testid="appeal-proof-image"
                  className="hidden"
                />
              </label>
              {appealImagePreview && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={appealImagePreview} alt="Proof preview" className="h-20 w-32 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setAppealImageFile(null);
                      setAppealImagePreview('');
                    }}
                    className="text-xs font-semibold text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
              <p className="mt-1 text-xs text-slate-500">JPG, PNG, or WebP up to 5MB.</p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setAppealFor(null)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={appealBusy} data-testid="submit-appeal" className="btn-primary">
                {appealBusy ? <Spinner label="Submitting..." /> : 'Submit appeal'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default SellerProductsPage;