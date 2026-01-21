import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { Sidebar } from '../../components/dashboard/Sidebar';
import { Loader2, Calendar, Clock, CheckCircle, Activity, User, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../components/ui';

export default function Dashboard() {
    const [activeSection, setActiveSection] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [doctorData, setDoctorData] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, confirmedToday: 0, completed: 0 });

    useEffect(() => {
        const fetchData = async () => {
            const user = auth.currentUser;
            if (!user) return;

            try {
                // Fetch Doctor Data
                const doctorDoc = await getDoc(doc(db, 'doctors', user.uid));
                if (doctorDoc.exists()) {
                    const data = doctorDoc.data();
                    setDoctorData(data);

                    // Fetch Appointments
                    const q = query(collection(db, 'appointments'), where('hospitalName', '==', data.hospital));
                    const snapshot = await getDocs(q);
                    const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    // Sort by date/time
                    apps.sort((a, b) => {
                        const dateA = new Date(`${a.appointmentDate} ${a.appointmentTime}`);
                        const dateB = new Date(`${b.appointmentDate} ${b.appointmentTime}`);
                        return dateB - dateA;
                    });

                    setAppointments(apps);

                    // Calculate Stats
                    const today = new Date().toISOString().split('T')[0];
                    setStats({
                        total: apps.length,
                        pending: apps.filter(a => a.status === 'pending').length,
                        confirmedToday: apps.filter(a => a.status === 'confirmed' && a.appointmentDate === today).length,
                        completed: apps.filter(a => a.status === 'completed').length,
                    });
                }
            } catch (err) {
                console.error("Error loading dashboard:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLogout = () => signOut(auth);

    const updateStatus = async (id, status) => {
        try {
            await updateDoc(doc(db, 'appointments', id), { status });
            // update local state
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
            // re-calc stats (simplified)
            // actually better to refetch or complex reducer, but this is fine for POC
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar active={activeSection} setActive={setActiveSection} onLogout={handleLogout} />

            <main className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-8">
                    <header className="mb-10 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-full -mr-10 -mt-10 opacity-50" />
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Hello, {doctorData?.name}</h2>
                            <div className="flex gap-6 text-slate-500 font-medium text-sm">
                                <span className="flex items-center gap-2"><Building2 size={16} /> {doctorData?.hospital}</span>
                                <span className="flex items-center gap-2"><Stethoscope size={16} /> {doctorData?.specialty}</span>
                            </div>
                        </div>
                    </header>

                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeSection === 'overview' && (
                            <Overview stats={stats} appointments={appointments} onUpdateStatus={updateStatus} />
                        )}
                        {activeSection === 'appointments' && (
                            <AppointmentsView appointments={appointments} onUpdateStatus={updateStatus} />
                        )}
                        {activeSection === 'patients' && (
                            <PatientsView appointments={appointments} />
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

// Components
import { Building2, Stethoscope } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        green: 'bg-green-50 text-green-600',
        indigo: 'bg-indigo-50 text-indigo-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", colors[color])}>
                    <Icon size={24} />
                </div>
                <div>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">{label}</p>
                    <p className="text-3xl font-bold text-slate-900">{value}</p>
                </div>
            </div>
        </div>
    );
}

function Overview({ stats, appointments, onUpdateStatus }) {
    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = appointments.filter(a => a.appointmentDate === today);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Calendar} label="Total Appointments" value={stats.total} color="blue" />
                <StatCard icon={Clock} label="Pending Reviews" value={stats.pending} color="yellow" />
                <StatCard icon={CheckCircle} label="Today's Schedule" value={stats.confirmedToday} color="green" />
                <StatCard icon={Activity} label="Completed Visits" value={stats.completed} color="indigo" />
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">Today's Appointments</h3>
                </div>
                <div className="p-6">
                    {todaysAppointments.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
                            <p>No appointments scheduled for today.</p>
                        </div>
                    ) : (
                        <AppointmentTable appointments={todaysAppointments} onUpdateStatus={onUpdateStatus} />
                    )}
                </div>
            </div>
        </div>
    );
}

function AppointmentsView({ appointments, onUpdateStatus }) {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-lg text-slate-800">All Appointments</h3>
            </div>
            <div className="p-0">
                <AppointmentTable appointments={appointments} onUpdateStatus={onUpdateStatus} />
            </div>
        </div>
    );
}

function PatientsView({ appointments }) {
    // Aggregate unique patients
    const patientsMap = new Map();
    appointments.forEach(app => {
        if (!patientsMap.has(app.patientEmail)) {
            patientsMap.set(app.patientEmail, {
                name: app.patientName,
                email: app.patientEmail,
                phone: app.patientPhone,
                visits: 0,
                lastVisit: app.appointmentDate
            });
        }
        const p = patientsMap.get(app.patientEmail);
        p.visits += 1;
        if (new Date(app.appointmentDate) > new Date(p.lastVisit)) {
            p.lastVisit = app.appointmentDate;
        }
    });

    const patients = Array.from(patientsMap.values());

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-lg text-slate-800">Patient Records</h3>
            </div>
            <table className="w-full text-left bg-white text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4">Patient Name</th>
                        <th className="px-6 py-4">Contact Info</th>
                        <th className="px-6 py-4">Total Visits</th>
                        <th className="px-6 py-4">Last Visit</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {patients.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                            <td className="px-6 py-4 text-slate-500">
                                <div className="flex flex-col gap-1">
                                    <span className="flex items-center gap-2"><Mail size={14} /> {p.email}</span>
                                    {p.phone && <span className="flex items-center gap-2"><Phone size={14} /> {p.phone}</span>}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-900">{p.visits}</td>
                            <td className="px-6 py-4 text-slate-500">{new Date(p.lastVisit).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {patients.length === 0 && (
                        <tr>
                            <td colSpan="4" className="text-center py-10 text-slate-500">No patient records found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

function AppointmentTable({ appointments, onUpdateStatus }) {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-green-100 text-green-700',
        completed: 'bg-blue-100 text-blue-700',
        cancelled: 'bg-red-100 text-red-700',
    };

    return (
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                    <th className="px-6 py-4">Time / Date</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Condition</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {appointments.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{app.appointmentTime}</div>
                            <div className="text-xs text-slate-500">{new Date(app.appointmentDate).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{app.patientName}</div>
                            <div className="text-xs text-slate-500">{app.patientEmail}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{app.reason}</td>
                        <td className="px-6 py-4">
                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider", statusColors[app.status] || 'bg-gray-100 text-gray-700')}>
                                {app.status}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex gap-2">
                                {app.status === 'pending' && (
                                    <button
                                        onClick={() => onUpdateStatus(app.id, 'confirmed')}
                                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 shadow-sm transition-colors"
                                    >
                                        Confirm
                                    </button>
                                )}
                                {app.status === 'confirmed' && (
                                    <button
                                        onClick={() => onUpdateStatus(app.id, 'completed')}
                                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 shadow-sm transition-colors"
                                    >
                                        Complete
                                    </button>
                                )}
                                {['pending', 'confirmed'].includes(app.status) && (
                                    <button
                                        onClick={() => onUpdateStatus(app.id, 'cancelled')}
                                        className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
