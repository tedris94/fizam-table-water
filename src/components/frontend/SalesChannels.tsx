import { Store, Warehouse, Factory, Truck } from 'lucide-react';

export function SalesChannels() {
  const channels = [
    {
      icon: Store,
      title: 'Retail Sales',
      description: 'Find us at major retail stores and supermarkets nationwide',
      features: ['Convenient locations', 'Always available', 'Multiple sizes']
    },
    {
      icon: Warehouse,
      title: 'Wholesale',
      description: 'Bulk purchasing options for businesses and distributors',
      features: ['Competitive pricing', 'Large quantities', 'Regular supply']
    },
    {
      icon: Factory,
      title: 'Direct from Factory',
      description: 'Purchase directly from our production facility',
      features: ['Best prices', 'Fresh production', 'Custom orders']
    },
    {
      icon: Truck,
      title: 'Home Delivery',
      description: 'Order online and get fresh water delivered to your doorstep',
      features: ['Convenient ordering', 'Fast delivery', 'Scheduled service']
    }
  ];

  return (
    <section id="sales" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl text-[#1a1f71] mb-4">
            How to Buy
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Multiple convenient ways to get your Fizam Table Water
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {channels.map((channel, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-t-4 border-[#2563eb]"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#1a1f71] to-[#2563eb] rounded-2xl flex items-center justify-center mb-6 transform -rotate-3">
                <channel.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl text-[#1a1f71] mb-3">
                {channel.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {channel.description}
              </p>
              <ul className="space-y-2">
                {channel.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-[#2563eb] rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-[#1a1f71] via-[#2563eb] to-[#0ea5e9] rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-12 items-center">
            <div className="text-white">
              <h3 className="text-3xl mb-4">
                Ready to Order?
              </h3>
              <p className="text-xl text-blue-100 mb-6">
                Contact us today to place your order or learn more about our distribution options. 
                We're here to serve you with the best quality water.
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="/order"
                  className="bg-white text-[#1a1f71] px-8 py-3 rounded-full hover:bg-blue-50 transition-colors inline-block"
                >
                  Get it Delivered
                </a>
                <a 
                  href="tel:+1234567890"
                  className="bg-transparent border-2 border-white px-8 py-3 rounded-full hover:bg-white/10 transition-colors inline-block"
                >
                  Call Now
                </a>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4">
              {[Store, Warehouse, Factory, Truck].map((Icon, index) => (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex items-center justify-center aspect-square"
                >
                  <Icon className="w-12 h-12 text-white" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
