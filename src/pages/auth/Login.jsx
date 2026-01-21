import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { Button, Input, Label } from '../../components/ui';

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if doctor profile exists
            const doctorDoc = await getDoc(doc(db, 'doctors', user.uid));

            if (!doctorDoc.exists()) {
                throw new Error('Account not found. Please create a professional account first.');
            }

            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Authentication failed. Please verify your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-8"
            >
                <div className="text-center mb-10">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                        <span className="text-3xl">👨‍⚕️</span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-slate-500 font-medium">Sign in to your medical dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="doctor@hospital.com"
                            icon={Mail}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            icon={Lock}
                            required
                        />
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2"
                        >
                            <span className="text-xl">⚠️</span> {error}
                        </motion.div>
                    )}

                    <Button type="submit" className="w-full text-lg" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Authenticating...
                            </>
                        ) : (
                            <>
                                Access Dashboard
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>

                    <p className="text-center text-slate-500 text-sm font-medium">
                        New to HealthVerse?{' '}
                        <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                            Create Account
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
