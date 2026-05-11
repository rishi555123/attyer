'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useToast } from '@/context/ToastContext';

export default function AdminProducts() {
  const { showToast } = useToast();
  const [editingProductId, setEditingProductId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [stockUpdateModal, setStockUpdateModal] = useState(null);
  const [newStockValue, setNewStockValue] = useState('');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: 'Kurta',
    fabric: '100% Cotton', gstRate: 12, gender: 'men',
    printType: 'other', discountedPrice: '', productType: 'Single Piece',
    topSizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
    bottomSizes: { '28': 0, '30': 0, '32': 0, '34': 0, '36': 0, '38': 0 },
    freeSizeStock: 0,
    imageFiles: []
  });

  const [filters, setFilters] = useState({
    search: '', gender: '', category: '', printType: '',
    minPrice: '', maxPrice: '', sort: 'newest', availability: ''
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getToken = () => JSON.parse(localStorage.getItem('attyer_user') || '{}')?.token;

  const fetchProducts = async (currentFilters = filters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      let data = res.data.data;
      if (currentFilters.availability === 'low') {
        data = data.filter(p => p.variants?.some(v => v.stock <= 5));
      }
      setProducts(data);
    } catch (err) {
      showToast('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleUpdateStock = async () => {
    if (!stockUpdateModal || newStockValue.trim() === '' || isNaN(newStockValue)) return;
    
    const { product, size } = stockUpdateModal;
    const updatedVariants = product.variants.map(v => 
      v.size === size ? { ...v, stock: Number(newStockValue) } : v
    );

    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/products/id/${product._id}`, 
        { variants: updatedVariants }, 
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      showToast('Stock updated successfully!');
      setStockUpdateModal(null);
      setNewStockValue('');
      fetchProducts();
    } catch (err) {
      showToast('Failed to update stock.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTopSizeChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, topSizes: { ...prev.topSizes, [name]: Number(value) } }));
  };

  const handleBottomSizeChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, bottomSizes: { ...prev.bottomSizes, [name]: Number(value) } }));
  };

  const applyTopSizeToAll = () => {
    const val = formData.topSizes['XS'];
    setFormData(prev => ({
      ...prev,
      topSizes: { XS: val, S: val, M: val, L: val, XL: val, XXL: val }
    }));
  };

  const applyBottomSizeToAll = () => {
    const val = formData.bottomSizes['28'];
    setFormData(prev => ({
      ...prev,
      bottomSizes: { '28': val, '30': val, '32': val, '34': val, '36': val, '38': val }
    }));
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

  const openEditModal = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      discountedPrice: product.discountedPrice || '',
      category: product.category,
      fabric: product.fabric,
      gstRate: product.gstRate,
      gender: product.gender,
      printType: product.printType,
      productType: product.productType || (['Saree', 'Dupatta'].includes(product.category) ? 'Free Size' : (['Salwar Suit', 'Palazzo'].includes(product.category) ? 'Top and Bottom Set' : ['Trouser', 'Skirt'].includes(product.category) ? 'Bottom Piece Only' : 'Single Piece')),
      topSizes: {
        XS: product.variants?.find(v => v.size === 'XS')?.stock || 0,
        S: product.variants?.find(v => v.size === 'S')?.stock || 0,
        M: product.variants?.find(v => v.size === 'M')?.stock || 0,
        L: product.variants?.find(v => v.size === 'L')?.stock || 0,
        XL: product.variants?.find(v => v.size === 'XL')?.stock || 0,
        XXL: product.variants?.find(v => v.size === 'XXL')?.stock || 0,
      },
      bottomSizes: {
        '28': product.variants?.find(v => v.size === '28')?.stock || 0,
        '30': product.variants?.find(v => v.size === '30')?.stock || 0,
        '32': product.variants?.find(v => v.size === '32')?.stock || 0,
        '34': product.variants?.find(v => v.size === '34')?.stock || 0,
        '36': product.variants?.find(v => v.size === '36')?.stock || 0,
        '38': product.variants?.find(v => v.size === '38')?.stock || 0,
      },
      freeSizeStock: product.variants?.find(v => v.size === 'Free Size')?.stock || 0,
      imageFiles: []
    });
    setImagePreviews(product.images?.map(img => img.url) || []);
    setEditingProductId(product._id);
    setIsModalOpen(true);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let images = editingProductId ? undefined : [{ url: 'https://placehold.co/600x800?text=Product', public_id: 'placeholder' }];

      if (formData.imageFiles.length > 0) {
        images = await Promise.all(formData.imageFiles.map(uploadImageToCloudinary));
      }

      let variants = [];
      if (formData.productType === 'Free Size') {
        variants = [{ size: 'Free Size', stock: Number(formData.freeSizeStock) }];
      } else {
        if (formData.productType === 'Single Piece' || formData.productType === 'Top and Bottom Set') {
          variants = [...variants, ...Object.entries(formData.topSizes).map(([size, stock]) => ({ size, stock: Number(stock) }))];
        }
        if (formData.productType === 'Bottom Piece Only' || formData.productType === 'Top and Bottom Set') {
          variants = [...variants, ...Object.entries(formData.bottomSizes).map(([size, stock]) => ({ size, stock: Number(stock) }))];
        }
      }

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
      };

      if (images && images.length > 0) payload.images = images;

      if (editingProductId) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/products/id/${editingProductId}`, payload, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        showToast('Product updated successfully');
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/products`, payload, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        showToast('Product added successfully');
      }

      setIsModalOpen(false);
      setEditingProductId(null);
      setFormData({ name: '', description: '', price: '', category: 'Kurta', fabric: '100% Cotton', gstRate: 12, gender: 'men', printType: 'other', discountedPrice: '', productType: 'Single Piece', topSizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 }, bottomSizes: { '28': 0, '30': 0, '32': 0, '34': 0, '36': 0, '38': 0 }, freeSizeStock: 0, imageFiles: [] });
      setImagePreviews([]);
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to save product');
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
          <button onClick={() => {
            setEditingProductId(null);
            setFormData({ name: '', description: '', price: '', category: 'Kurta', fabric: '100% Cotton', gstRate: 12, gender: 'men', printType: 'other', discountedPrice: '', productType: 'Single Piece', topSizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 }, bottomSizes: { '28': 0, '30': 0, '32': 0, '34': 0, '36': 0, '38': 0 }, freeSizeStock: 0, imageFiles: [] });
            setImagePreviews([]);
            setIsModalOpen(true);
          }} className="bg-kashish text-ivory px-4 py-2 text-sm rounded hover:bg-terracotta">
            + Add Product
          </button>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); fetchProducts(); }} className="mb-6 bg-cream/30 p-4 rounded border border-sand/30 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-label text-kashish mb-1">Search</label>
          <input name="search" value={filters.search} onChange={handleFilterChange} placeholder="Product name..." className="p-2 border border-sand/40 rounded text-sm w-48" />
        </div>
        <div>
          <label className="block text-xs font-label text-kashish mb-1">Category</label>
          <select name="category" value={filters.category} onChange={handleFilterChange} className="p-2 border border-sand/40 rounded text-sm w-32">
            <option value="">All</option>
            {['Kurta', 'Saree', 'Salwar Suit', 'Dupatta', 'Dress', 'Shirt', 'Trouser'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-label text-kashish mb-1">Gender</label>
          <select name="gender" value={filters.gender} onChange={handleFilterChange} className="p-2 border border-sand/40 rounded text-sm w-32">
            <option value="">All</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-label text-kashish mb-1">Print Type</label>
          <select name="printType" value={filters.printType} onChange={handleFilterChange} className="p-2 border border-sand/40 rounded text-sm w-32">
            <option value="">All</option>
            {['sanganeri','bagru','ajrakh','kalamkari','bandhani','dabu','bagh','leheriya','solid','other'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-label text-kashish mb-1">Min Price</label>
          <input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} placeholder="₹" className="p-2 border border-sand/40 rounded text-sm w-24" />
        </div>
        <div>
          <label className="block text-xs font-label text-kashish mb-1">Max Price</label>
          <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder="₹" className="p-2 border border-sand/40 rounded text-sm w-24" />
        </div>
        <div>
          <label className="block text-xs font-label text-kashish mb-1">Sort By</label>
          <select name="sort" value={filters.sort} onChange={handleFilterChange} className="p-2 border border-sand/40 rounded text-sm w-36">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-label text-kashish mb-1">Availability</label>
          <select name="availability" value={filters.availability} onChange={handleFilterChange} className="p-2 border border-sand/40 rounded text-sm w-32">
            <option value="">All</option>
            <option value="low">Low Stock (&le; 5)</option>
          </select>
        </div>
        <div className="flex gap-2 ml-auto">
          <button type="button" onClick={() => {
            const resetFilters = { search: '', gender: '', category: '', printType: '', minPrice: '', maxPrice: '', sort: 'newest', availability: '' };
            setFilters(resetFilters);
            fetchProducts(resetFilters);
          }} className="px-4 py-2 border border-sand text-kashish text-sm rounded hover:bg-cream">
            Clear
          </button>
          <button type="submit" className="px-4 py-2 bg-kashish text-ivory text-sm rounded hover:bg-terracotta">
            Apply
          </button>
        </div>
      </form>

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
                <td className="p-4">
                  {p.variants?.some(v => v.stock <= 5) ? (
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0} Total</span>
                      {p.variants.filter(v => v.stock <= 5).map(v => (
                        <div key={v.size} className="flex gap-2 items-center text-xs bg-red-50/50 p-1 rounded border border-red-100">
                          <span className="text-red-500 font-bold">{v.size}: {v.stock}</span>
                          <button onClick={() => { setStockUpdateModal({ product: p, size: v.size }); setNewStockValue(v.stock.toString()); }} className="text-terracotta underline hover:text-kashish ml-auto">Update</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span>{p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0}</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => openEditModal(p)} className="text-xs text-kashish hover:text-terracotta hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDeactivate(p._id)} className="text-xs text-red-500 hover:underline">
                      Deactivate
                    </button>
                  </div>
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
              <h2 className="text-2xl font-display text-kashish">{editingProductId ? 'Edit Product' : 'Add New Product'}</h2>
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
                <div>
                  <label className="block text-sm font-label text-kashish mb-1">Product Type *</label>
                  <select required name="productType" value={formData.productType} onChange={handleInputChange} className="w-full p-2 border border-sand/40 rounded">
                    <option value="Single Piece">Single Piece (Top/One-piece)</option>
                    <option value="Top and Bottom Set">Top and Bottom Set</option>
                    <option value="Bottom Piece Only">Bottom Piece Only</option>
                    <option value="Free Size">Free Size (Saree/Dupatta/One-size)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-label text-kashish mb-1">Description *</label>
                  <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full p-2 border border-sand/40 rounded" />
                </div>
              </div>

              <div className="space-y-4">
                {(formData.productType === 'Single Piece' || formData.productType === 'Top and Bottom Set') && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-label text-kashish">Top / Regular Sizes & Stock</label>
                      <button type="button" onClick={applyTopSizeToAll} className="text-xs text-terracotta hover:underline bg-cream px-2 py-1 rounded border border-sand/20">
                        Copy 'XS' value to all
                      </button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                        <div key={size} className="flex-1 min-w-[3rem]">
                          <label className="block text-xs text-sand mb-1">{size}</label>
                          <input type="number" name={size} value={formData.topSizes[size]} onChange={handleTopSizeChange} min="0" className="w-full p-2 border border-sand/40 rounded text-sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {(formData.productType === 'Bottom Piece Only' || formData.productType === 'Top and Bottom Set') && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-label text-kashish">Bottom Sizes & Stock (Waist)</label>
                      <button type="button" onClick={applyBottomSizeToAll} className="text-xs text-terracotta hover:underline bg-cream px-2 py-1 rounded border border-sand/20">
                        Copy '28' value to all
                      </button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {['28', '30', '32', '34', '36', '38'].map(size => (
                        <div key={size} className="flex-1 min-w-[3rem]">
                          <label className="block text-xs text-sand mb-1">{size}</label>
                          <input type="number" name={size} value={formData.bottomSizes[size]} onChange={handleBottomSizeChange} min="0" className="w-full p-2 border border-sand/40 rounded text-sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.productType === 'Free Size' && (
                  <div>
                    <label className="block text-sm font-label text-kashish mb-2">Total Stock (Free Size)</label>
                    <input type="number" name="freeSizeStock" value={formData.freeSizeStock} onChange={handleInputChange} min="0" className="w-full p-2 border border-sand/40 rounded text-sm max-w-[150px]" />
                  </div>
                )}
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
                  {isSubmitting ? 'Saving...' : (editingProductId ? 'Update Product' : 'Save Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Update Modal */}
      {stockUpdateModal && (
        <div className="fixed inset-0 bg-kashish/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white p-6 rounded shadow-xl w-full max-w-sm">
            <h3 className="font-display text-xl text-kashish mb-4">Update Stock</h3>
            <p className="text-sm text-sand mb-4">
              Update stock for <span className="font-medium text-kashish">{stockUpdateModal.product.name}</span> (Size {stockUpdateModal.size})
            </p>
            <input 
              type="number" 
              value={newStockValue} 
              onChange={(e) => setNewStockValue(e.target.value)} 
              className="w-full p-2 border border-sand/30 rounded mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setStockUpdateModal(null)} className="px-4 py-2 text-sm border border-sand/30 text-kashish rounded hover:bg-cream">Cancel</button>
              <button onClick={handleUpdateStock} className="px-4 py-2 text-sm bg-kashish text-white rounded hover:bg-terracotta">Save Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}