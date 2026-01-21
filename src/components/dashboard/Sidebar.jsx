import React from 'react';
import { LayoutDashboard, Calendar, Users, LogOut, Activity } from 'lucide-react';
import { Button } from '../ui';
import { clsx } from 'clsx';

export function Sidebar({ active, setActive, onLogout }) {
    const menuItems = [
        { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
        { id: 'appointments', label: 'Patient Appointments', icon: Calendar },
        { id: 'patients', label: 'Patient Records', icon: Users },
    ];

    return (
        <div className="w-72 bg-white h-screen border-r border-slate-200 flex flex-col p-6 shadow-sm z-10">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                    H
                </div>
                <div>
                    <h1 className="font-bold text-xl text-slate-800 tracking-tight">HealthVerse</h1>
                    <p className="text-xs text-slate-500 font-medium">Doctor Portal</p>
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActive(item.id)}
                            className={clsx(
                                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm',
                                isActive
                                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            )}
                        >
                            <Icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-100">
                <Button
                    variant="danger"
                    onClick={onLogout}
                    className="w-full justify-start px-4"
                >
                    <LogOut size={18} className="mr-3" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
