import React from 'react';
import iptiLogo from '../assets/logo ipti.png';
import { Instagram, Youtube, Linkedin, Mail, MapPin, Clock } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          {/* Kolom 1: Brand & Identitas */}
          <div className="space-y-4">
            <img src={iptiLogo} alt="IPTI Logo" className="h-24 w-auto" />
            <h3 className="font-bold text-slate-900 text-xl">Tedja Indonesia</h3>
            <p className="text-slate-600 text-sm leading-relaxed max-w-xs">
              Pusat Jaminan Mutu Institut Pariwisata Tedja Indonesia. 
              Berkomitmen menghadirkan standar kualitas pendidikan pariwisata berkelas global.
            </p>
          </div>

          {/* Kolom 2: Kontak Detail */}
          <div className="space-y-6">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-sm">Informasi Kontak</h4>
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <a href="mailto:pjm@ipti.ac.id" className="hover:text-slate-900 transition-colors">pjm@ipti.ac.id</a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <p>Jl. Hwarang, Setu, Cipayung<br />Jakarta Timur 13880</p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <p>Senin - Jumat: 08:00 - 17:00 WIB</p>
              </div>
            </div>
          </div>

          {/* Kolom 3: Google Maps & Sosial */}
          <div className="space-y-6">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-sm">Lokasi & Sosial</h4>
            
            {/* Google Maps Embed dengan Pencarian / Pin Otomatis */}
            <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-200 shadow-md">
              <iframe
                title="Peta Lokasi Institut Pariwisata Tedja Indonesia"
                src="https://maps.google.com/maps?q=Institut+Pariwisata+Tedja+Indonesia&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/tedja.indonesia" className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"><Instagram size={20} /></a>
              <a href="https://www.tiktok.com/@tedja.indonesia" className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"><FaTiktok size={18} /></a>
              <a href="https://www.youtube.com/@tedja.indonesia" className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"><Youtube size={20} /></a>
              <a href="https://www.linkedin.com/company/tedjaindonesia" className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"><Linkedin size={20} /></a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-8 text-center md:text-center">
          <p className="text-xs text-slate-500 font-medium">
            © 2026 Penjaminan Mutu - Institut Pariwisata Tedja Indonesia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};