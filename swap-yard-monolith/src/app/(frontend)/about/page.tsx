import React from "react";
import { ShieldCheck, CreditCard, MapPin} from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#002B45] py-16 text-center">
        <h1 className="text-3xl font-bold text-white uppercase tracking-widest">About Us</h1>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20 space-y-32">
        <section className="grid md:grid-cols-2 gap-12 items-start">
          <h2 className="text-2xl font-bold text-slate-900">Introduction to Swapyard!</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Founded in 2025, SwapYard was created to address the growing demand for a more trusted and user-friendly marketplace for secondhand goods.
          </p>
        </section>

        <section className="relative grid grid-cols-12 gap-4">
          <div className="col-span-7 relative rounded-2xl overflow-hidden shadow-xl">
            <img 
              src="https://res.cloudinary.com/defk6gaq2/image/upload/v1778946346/Household_op3i1l.jpg" 
              alt="People shopping" 
              className="w-full h-[400px] object-cover"
            />
          </div>
          <div className="col-span-7 col-start-6 -mt-32 relative z-10 rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
            <img 
              src="https://res.cloudinary.com/defk6gaq2/image/upload/v1778946346/Master-Bedroom_wu0x2w.webp" 
              alt="Video thumbnail" 
              className="w-full h-[300px] object-cover"
            />
            
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-12 items-start">
          <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            At SwapYard, we aim to make it easier for people to find quality, affordable, and eco-friendly furniture and home items. Whether you're moving to a new home or looking to declutter, we're here to help you connect with local buyers and sellers in your community.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our mission is to provide a reliable and simple platform for buying and selling quality furniture, reducing waste, and promoting a more sustainable way of shopping.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative rounded-2xl overflow-hidden">
            <img 
              src="https://res.cloudinary.com/defk6gaq2/image/upload/v1778946346/rooms-in-the-house_okqrvo.jpg" 
              alt="Showroom" 
              className="w-full h-[500px] object-cover"
            />
            
          </div>
          
          <div className="space-y-12">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">Our Services</h2>
              <p className="text-slate-500 text-sm">Tailored solutions for seamless buying and selling</p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <ServiceItem icon={<ShieldCheck />} title="Verified Sellers" desc="Shop confidently with sellers who have been ID-verified" />
              <ServiceItem icon={<CreditCard />} title="Secure Payments" desc="Make payment confidently on our Platform" />
              <ServiceItem icon={<MapPin />} title="Local Listings" desc="Buy and Sell within your city or neighborhood" />
            </div>
          </div>
        </section>

        <section className="text-center py-20 relative overflow-hidden">

            {[...Array(8)].map((_, i) => (
                <div key={i} className={`absolute w-12 h-12 rounded-full bg-gradient-to-br from-slate-400 to-red-300 opacity-40`} 
                style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                }}/>
            ))}
            
            <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
                <p className="text-slate-500 text-sm mb-8">Explore thousands of products from trusted sellers near you.<br/>Browse unique secondhand furniture and home essentials.</p>
                <button className="bg-[#F0441D] text-white px-10 py-3 rounded-lg font-bold hover:bg-red-600 transition-colors">
                    
                    <Link href="/listings">Get Started</Link>
                </button>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ServiceItem({ icon, title, desc }: { icon: React.ReactElement<{ className?: string }>, title: string, desc: string }) {
  return (
    <div className="space-y-3">
      <div className="bg-[#002B45] text-white w-10 h-10 rounded-lg flex items-center justify-center">
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      <h4 className="font-bold text-sm">{title}</h4>
      <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}