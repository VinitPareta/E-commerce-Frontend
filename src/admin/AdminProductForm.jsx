import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSave, FiUpload, FiX } from 'react-icons/fi';
import api from '../utils/api';
import { buildImageUrl } from '../utils/helpers';

const empty = {
  name: '',
  description: '',
  price: 0,
  discountPrice: 0,
  category: 'Men',
  subCategory: 'Other',
  brand: 'DS Store',
  stock: 0,
  sizes: [],
  colors: [],
  images: [],
  isFeatured: false,
  isTrending: false,
};

const categories = ['Men', 'Women', 'Kids', 'Accessories'];
const subCategories = [
  'T-Shirts',
  'Shirts',
  'Jeans',
  'Dresses',
  'Tops',
  'Shoes',
  'Bags',
  'Watches',
  'Other',
];

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/products/${id}`)
      .then((res) => {
        const p = res.data.product;
        setForm({
          name: p.name,
          description: p.description,
          price: p.price,
          discountPrice: p.discountPrice || 0,
          category: p.category,
          subCategory: p.subCategory || 'Other',
          brand: p.brand || 'DS Store',
          stock: p.stock,
          sizes: p.sizes || [],
          colors: p.colors || [],
          images: p.images || [],
          isFeatured: p.isFeatured || false,
          isTrending: p.isTrending || false,
        });
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : ['price', 'discountPrice', 'stock'].includes(name)
          ? Number(value)
          : value,
    }));
  };

  const handleArrayChange = (key) => (e) => {
    const v = e.target.value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setForm({ ...form, [key]: v });
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, images: [...prev.images, data.url] }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addUrlImage = () => {
    if (!imageUrlInput.trim()) return;
    setForm((prev) => ({ ...prev, images: [...prev.images, imageUrlInput.trim()] }));
    setImageUrlInput('');
  };

  const removeImage = (idx) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.price) {
      toast.error('Please fill required fields');
      return;
    }
    try {
      setSaving(true);
      if (isEdit) {
        await api.put(`/products/${id}`, form);
        toast.success('Product updated');
      } else {
        await api.post('/products', form);
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/admin/products" className="btn-ghost p-2">
          <FiArrowLeft />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold">
            {isEdit ? 'Edit Product' : 'New Product'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEdit ? 'Update product details' : 'Add a new product to your store'}
          </p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-3"
      >
        <div className="space-y-6 lg:col-span-2">
          <div className="card-glass p-6">
            <h3 className="mb-4 text-lg font-semibold">Basic Info</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Product Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Brand</label>
                <input
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="input"
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Sub Category</label>
                <select
                  name="subCategory"
                  value={form.subCategory}
                  onChange={handleChange}
                  className="input"
                >
                  {subCategories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card-glass p-6">
            <h3 className="mb-4 text-lg font-semibold">Variants</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Sizes (comma separated)</label>
                <input
                  value={form.sizes.join(', ')}
                  onChange={handleArrayChange('sizes')}
                  placeholder="S, M, L, XL"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Colors (comma separated)</label>
                <input
                  value={form.colors.join(', ')}
                  onChange={handleArrayChange('colors')}
                  placeholder="Pink, White, Black"
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="card-glass p-6">
            <h3 className="mb-4 text-lg font-semibold">Images</h3>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {form.images.map((url, i) => (
                <div
                  key={i}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-brand-pink-soft"
                >
                  <img
                    src={buildImageUrl(url)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition group-hover:opacity-100"
                  >
                    <FiX className="text-xs" />
                  </button>
                </div>
              ))}
              <label
                className={`flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-brand-pink hover:text-brand-pink ${
                  uploading ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                <FiUpload />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Or paste image URL..."
                className="input"
              />
              <button
                type="button"
                onClick={addUrlImage}
                className="btn-outline"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-glass p-6">
            <h3 className="mb-4 text-lg font-semibold">Pricing</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="input"
                  min={0}
                  required
                />
              </div>
              <div>
                <label className="label">Discount Price (₹)</label>
                <input
                  type="number"
                  name="discountPrice"
                  value={form.discountPrice}
                  onChange={handleChange}
                  className="input"
                  min={0}
                />
              </div>
              <div>
                <label className="label">Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  className="input"
                  min={0}
                  required
                />
              </div>
            </div>
          </div>

          <div className="card-glass p-6">
            <h3 className="mb-4 text-lg font-semibold">Visibility</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                  className="accent-brand-pink"
                />
                <span className="text-sm">Featured Product</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isTrending"
                  checked={form.isTrending}
                  onChange={handleChange}
                  className="accent-brand-pink"
                />
                <span className="text-sm">Trending Now</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
            {!saving && <FiSave />}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default AdminProductForm;
