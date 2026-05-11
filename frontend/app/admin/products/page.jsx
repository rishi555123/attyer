'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);
  const csvInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: 'Kurta',
    fabric: '100% Cotton', gstRate: 12, gender: 'men',
    printType: 'other', discountedPrice: '',
    sizes: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
    imageFiles: []
  });

  const getToken = () => JSON.parse(localStorage.getItem('attyer_user') || '{}')?.token;

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setProducts(res.data.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, sizes: { ...prev.sizes, [name]: Number(value) } }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, imageFiles: [...prev.imageFiles, ...files] }));
    const previews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, imageFiles: prev.imageFiles.filter((_, i) => i !== index) }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImageToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'attyer_preset');
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, data
    );
    return { url: res.data.secure_url, public_id: res.data.public_id };
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let images = [{ url: 'https://placehold.co/600x800?text=Product', public_id: 'placeholder' }];

      if (formData.imageFiles.length > 0) {
        images = await Promise.all(formData.imageFiles.map(uploadImageToCloudinary));
      }

      const variants = Object.entries(formData.sizes).map(([size, stock]) => ({ size, stock: Number(stock) }));

      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        discountedPrice: formData.discountedPrice ? Number(formData.discountedPrice) : undefined,
        category: formData.category,
        fabric: formData.fabric,
        gstRate: Number(formData.gstRate),
        gender: formData.gender,
        printType: formData.printType,
        variants,
        images
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/products`, payload, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      setIsModalOpen(false);
      setFormData({ name: '', description: '', price: '', category: 'Kurta', fabric: '100% Cotton', gstRate: 12, gender: 'men', printType: 'other', discountedPrice: '', sizes: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 }, imageFiles: [] });
      setImagePreviews([]);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/products/id/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      fetchProducts();
    } catch (err) {
      alert('Failed to deactivate product');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-3xl text-kashish">Products Management</h1>
        <div className="flex gap-4">
          <input type="file" accept=".csv" ref={csvInputRef} className="hidden" />
          <button onClick={() => csvInputRef.current?.click()} className="bg-sand/20 text-kashish px-4 py-2 text-sm rounded hover:bg-sand/40">
            Import CSV
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-kashish text-ivory px-4 py-2 text-sm rounded hover:bg-terracotta">
            + Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded border border-sand/30 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-kashish font-label border-b border-sand/30">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand/10 text-kashish">
            {loading ? (
              <tr><td className="p-4 text-center text-sand" colSpan="6">Loading products...</td></tr>
            ) : products.length > 0 ? products.map(p => (
              <tr key={p._id} className="hover:bg-cream/20">
                <td className="p-4 flex items-center gap-3">
                  {p.images?.[0]?.url && <img src={p.images[0].url} alt={p.name} className="w-10 h-12 object-cover rounded" />}
                  <span className="font-medium">{p.name}</span>
                </td>
                <td className="p-4">{p.category}</td>
                <td className="p-4">₹{p.price}</td>
                <td className="p-4">{p.variants?.reduce((a, v) => a + v.stock, 0) || 0}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => handleDeactivate(p._id)} className="text-xs text-red-500 hover:underline">
                    Deactivate
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td className="p-4 text-center text-sand" colSpan="6">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-kashish/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display text-kashish">Add New Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-sand hover:text-terracotta text-2xl">&times;</button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-label text-kashish mb-1">Name *</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border border-sand/40 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-label text-kashish mb-1">Category *</label>
                  <select required name="category" value={formData.category} onChange={handleInputChange} className="w-full p-2 border border-sand/40 rounded">
                    {['Kurta', 'Saree', 'Salwar Suit', 'Dupatta', 'Dress', 'Shirt', 'Trouser'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-label text-kashish mb-1">Price (₹) *</label>
                  <input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full p-2 border border-sand/40 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-label text-kashish mb-1">Discounted Price (₹)</label>
                  <input type="number" name="discountedPrice" value={formData.discountedPrice} onChange={handleInputChange} className="w-full p-2 border border-sand/40 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-label text-kashish mb-1">Gender *</label>
                  <select required name="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-2 border border-sand/40 rounded">
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-label text-kashish mb-1">Print Type</label>
                  <select name="printType" value={formData.printType} onChange={handleInputChange} className="w-full p-2 border border-sand/40 rounded">
                    {['sanganeri','bagru','ajrakh','kalamkari','bandhani','dabu','bagh','leheriya','solid','other'].map(p => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-label text-kashish mb-1">Fabric *</label>
                  <input required name="fabric" value={formData.fabric} onChange={handleInputChange} className="w-full p-2 border border-sand/40 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-label text-kashish mb-1">GST Rate (%)</label>
                  <input type="number" name="gstRate" value={formData.gstRate} onChange={handleInputChange} className="w-full p-2 border border-sand/40 rounded" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-label text-kashish mb-1">Description *</label>
                  <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full p-2 border border-sand/40 rounded" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-label text-kashish mb-2">Sizes & Stock</label>
                <div className="flex gap-3">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <div key={size} className="flex-1">
                      <label className="block text-xs text-sand mb-1">{size}</label>
                      <input type="number" name={size} value={formData.sizes[size]} onChange={handleSizeChange} min="0" className="w-full p-2 border border-sand/40 rounded text-sm" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Multiple Images */}
              <div>
                <label className="block text-sm font-label text-kashish mb-2">Product Images (multiple allowed)</label>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="w-full p-2 border border-sand/40 rounded text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-cream file:text-kashish" />
                {imagePreviews.length > 0 && (
                  <div className="flex gap-3 mt-3 flex-wrap">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative">
                        <img src={src} alt="" className="w-20 h-24 object-cover rounded border border-sand/20" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-sand text-kashish rounded hover:bg-cream">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-kashish text-ivory rounded hover:bg-terracotta disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}