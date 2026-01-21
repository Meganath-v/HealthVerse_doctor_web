import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Building2, Phone, Stethoscope, Loader2, ArrowRight } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { Button, Input, Label, Select } from '../../components/ui';

export default function Signup() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const specialties = [
        { value: 'Cardiology', label: 'Cardiology' },
        { value: 'Neurology', label: 'Neurology' },
        { value: 'Orthopedics', label: 'Orthopedics' },
        { value: 'Pediatrics', label: 'Pediatrics' },
        { value: 'Gynecology', label: 'Gynecology' },
        { value: 'Dermatology', label: 'Dermatology' },
        { value: 'Oncology', label: 'Oncology' },
        { value: 'Radiology', label: 'Radiology' },
        { value: 'Emergency Medicine', label: 'Emergency Medicine' },
        { value: 'General Medicine', label: 'General Medicine' },
        { value: 'Surgery', label: 'Surgery' },
        { value: 'Psychiatry', label: 'Psychiatry' },
        { value: 'Anesthesiology', label: 'Anesthesiology' },
        { value: 'Pathology', label: 'Pathology' }
    ];

    const addHospitalToList = async (hospitalName) => {
        try {
            const hospitalsRef = collection(db, 'hospitals');
            const q = query(hospitalsRef, where('name', '==', hospitalName));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                await addDoc(hospitalsRef, {
                    name: hospitalName,
                    addedAt: new Date().toISOString(),
                    isActive: true
                });
            }
        } catch (err) {
            console.error('Error adding hospital:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;

            const doctorInfo = {
                name: data.name.trim(),
                email: data.email.toLowerCase().trim(),
                hospital: data.hospital.trim(),
                phone: data.phone.trim(),
                specialty: data.specialty,
                createdAt: new Date().toISOString(),
                isActive: true
            };

            await setDoc(doc(db, 'doctors', user.uid), doctorInfo);
            await addHospitalToList(data.hospital.trim());

            setSuccess('Account created successfully!');
            setTimeout(() => navigate('/dashboard'), 1500);

        } catch (err) {
            console.error(err);
            setError(err.message || 'Account creation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-10 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-8"
            >
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        Join HealthVerse
                    </h1>
                    <p className="text-slate-500 font-medium">Create your professional medical account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" placeholder="Dr. John Smith" icon={User} required />
                        </div>

                        <div>
                            <Label htmlFor="email">Professional Email</Label>
                            <Input id="email" name="email" type="email" placeholder="doctor@hospital.com" icon={Mail} required />
                        </div>

                        <div>
                            <Label htmlFor="password">Secure Password</Label>
                            <Input id="password" name="password" type="password" placeholder="Min. 8 characters" icon={Lock} required />
                        </div>

                        <div>
                            <Label htmlFor="hospital">Hospital / Clinic</Label>
                            <Input id="hospital" name="hospital" placeholder="Healthcare Facility" icon={Building2} required />
                        </div>

                        <div>
                            <Label htmlFor="phone">Contact Number</Label>
                            <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" icon={Phone} required />
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="specialty">Medical Specialty</Label>
                            <Select id="specialty" name="specialty" options={specialties} icon={Stethoscope} required />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                            ⚠️ {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-green-600 text-sm font-medium">
                            ✅ {success}
                        </div>
                    )}

                    <Button type="submit" className="w-full text-lg" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            <>
                                Create Professional Account
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>

                    <p className="text-center text-slate-500 text-sm font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                            Sign In
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
