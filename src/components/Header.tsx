import React, { useState, useEffect } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import iptiLogo from '../assets/logo ipti.png';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Header = () => {
    const location = useLocation();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [navItems, setNavItems] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/get_menus.php`)
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success' && res.data) {
                    // FILTER MUTLAK: Buang semua menu yang mengandung kata beranda/home atau rute admin-konten/beranda
                    const cleanMenus = res.data.filter((menu: any) => {
                        const label = (menu.label || '').toLowerCase();
                        const route = (menu.to || '').toLowerCase();
                        return !label.includes('beranda') && !label.includes('home') && !route.includes('admin-konten/beranda');
                    });
                    setNavItems(cleanMenus);
                }
            })
            .catch(err => console.error("Gagal memuat menu navbar:", err));
    }, []);

    const isActive = (menuName: string, subItems?: any[], menuRoute?: string) => {
        if (location.pathname === '/') return false;
        if (menuRoute && location.pathname === menuRoute) return true;
        if (location.pathname.includes(menuName.toLowerCase())) return true;
        if (subItems) return subItems.some(sub => sub.to === location.pathname);
        return false;
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

                {/* Logo & Judul Website (Tombol Beranda Utama ke '/') */}
                <Link to="/" className="flex items-center gap-2 md:gap-4 hover:opacity-80 transition-opacity">
                    <img src={iptiLogo} alt="IPTI Logo" className="h-8 md:h-10 w-auto object-contain" />
                    <span className="text-sm md:text-lg font-bold text-gray-900 tracking-wide hidden sm:block">
                        Pusat Jaminan Mutu 
                    </span>
                </Link>

                {/* Desktop Nav + Login Button */}
                <div className="flex items-center space-x-4 md:space-x-8 h-full">
                    <nav className="hidden md:flex space-x-8 text-sm font-medium h-full">
                        {navItems.map((menu) => {
                            const hasSubItems = menu.subItems && menu.subItems.length > 0;

                            return (
                                <div key={menu.id || menu.label} className="relative h-full flex items-center"
                                    onMouseEnter={() => hasSubItems && setOpenDropdown(menu.label)}
                                    onMouseLeave={() => setOpenDropdown(null)}>
                                    
                                    {hasSubItems ? (
                                        <button className={`h-full flex items-center border-b-2 transition-all gap-1 cursor-pointer ${isActive(menu.label, menu.subItems, menu.to) ? 'border-[#367fa9] text-[#367fa9]' : 'border-transparent text-gray-900 hover:text-[#367fa9] hover:border-[#367fa9]'}`}>
                                            {menu.label}
                                        </button>
                                    ) : (
                                        <Link 
                                            to={menu.to ? (menu.to as any) : '#'} 
                                            className={`h-full flex items-center border-b-2 transition-all ${location.pathname === menu.to ? 'border-[#367fa9] text-[#367fa9]' : 'border-transparent text-gray-900 hover:text-[#367fa9] hover:border-[#367fa9]'}`}
                                        >
                                            {menu.label}
                                        </Link>
                                    )}

                                    {hasSubItems && openDropdown === menu.label && (
                                        <div className="absolute top-16 left-0 w-60 bg-white border border-gray-200 shadow-md rounded-none py-2 z-50">
                                            {menu.subItems.map((sub: any) => (
                                                <Link 
                                                    key={sub.id || sub.label} 
                                                    to={sub.to ? (sub.to as any) : '#'} 
                                                    className={`block px-4 py-2 text-sm transition-colors ${location.pathname === sub.to ? 'bg-gray-100 text-[#367fa9] font-semibold' : 'text-gray-700 hover:bg-gray-100 hover:text-[#367fa9]'}`}
                                                >
                                                    {sub.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Tombol Login */}
                    <Link
                        to="/index1"
                        className="flex px-3 md:px-5 py-1.5 md:py-2 text-[#367fa9] border border-[#367fa9] rounded hover:bg-[#367fa9] hover:text-white transition-all duration-300 font-bold uppercase text-[10px] md:text-xs tracking-wider"
                    >
                        Login
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden p-2 text-gray-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 shadow-xl z-50 rounded-none max-h-[80vh] overflow-y-auto">
                    {navItems.map((menu) => (
                        <div key={menu.id || menu.label} className="py-2">
                            <div className="font-semibold text-gray-900 border-b pb-1 mb-1">{menu.label}</div>
                            {menu.subItems?.map((sub: any) => (
                                <Link 
                                    key={sub.id || sub.label} 
                                    to={sub.to ? (sub.to as any) : '#'} 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block py-1.5 pl-4 text-sm text-gray-600 hover:text-[#367fa9]"
                                >
                                    {sub.label}
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </header>
    );
};