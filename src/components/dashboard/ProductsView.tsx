import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Package, Plus, Edit, Trash2 } from 'lucide-react';

interface ProductsViewProps {
  role: string;
}

export function ProductsView({ role }: ProductsViewProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=500&depth=1')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.docs ?? [])
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Products Management" role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl text-[#1a1f71] mb-2">Product Catalog</h2>
            <p className="text-gray-600">Manage your water products inventory</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1a1f71] to-[#2563eb] text-white rounded-xl hover:shadow-lg transition-all">
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading products...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <Package className="w-20 h-20 text-[#2563eb]" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl text-[#1a1f71] mb-2">{product.name}</h3>
                  <div className="text-sm text-gray-600 mb-2">{product.size}</div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl text-[#2563eb]">₦{product.price.toLocaleString()}</div>
                    <div className={`text-sm px-3 py-1 rounded-full ${product.stock > 100 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {product.stock} in stock
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-[#2563eb] rounded-lg hover:bg-blue-100 transition-colors">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
