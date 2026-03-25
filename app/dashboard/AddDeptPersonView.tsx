'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_DEPARTMENTS } from '@/graphql/queries';
import { useAuth } from '@/app/context/AuthContext';
import { useNavigation } from '@/app/context/NavigationContext';
import { demoStore } from '@/lib/demoStore';

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';

interface DeptPersonFormValues {
    name: string;
    email: string;
    phone: string;
    department_id: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    phone?: string;
    department_id?: string;
}

export function AddDeptPersonView() {
    const { user } = useAuth();
    const { setCurrentView } = useNavigation();

    const [formValues, setFormValues] = useState<DeptPersonFormValues>({
        name: '',
        email: '',
        phone: '',
        department_id: user?.department_id ?? '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

    const { data: deptData } = useQuery(GET_DEPARTMENTS);
    useEffect(() => { if (deptData?.departments) setDepartments(deptData.departments); }, [deptData]);

    const validateField = (name: string, value: string): string => {
        if (name === 'name') {
            if (!value.trim()) return 'Name is required';
            if (value.trim().length < 2) return 'Name must be at least 2 characters';
            if (value.trim().length > 100) return 'Name cannot exceed 100 characters';
            return '';
        }
        if (name === 'email') {
            if (!value.trim()) return 'Email is required';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
            if (value.length > 100) return 'Email cannot exceed 100 characters';
            return '';
        }
        if (name === 'phone') {
            if (value && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(value)) {
                return 'Invalid phone format';
            }
            return '';
        }
        if (name === 'department_id') {
            if (!value) return 'Department is required';
            return '';
        }
        return '';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));

        if (touched[name]) {
            const error = validateField(name, value);
            setErrors((prev) => ({ ...prev, [name]: error }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        Object.entries(formValues).forEach(([key, value]) => {
            const error = validateField(key, value);
            if (error) newErrors[key as keyof FormErrors] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        setSubmitError('');

        try {
            const payload = {
                name: formValues.name.trim(),
                email: formValues.email.trim().toLowerCase(),
                phone: formValues.phone || undefined,
                department_id: formValues.department_id,
            };

            if (IS_DEMO) {
                demoStore.addDeptPerson(payload);
                setCurrentView('dashboard');
            } else {
                const res = await fetch('/api/users/create-department-person', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: payload.name,
                        email: payload.email,
                        phone: payload.phone ?? null,
                        department_id: payload.department_id,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || 'Failed to add department person');
                }

                setCurrentView('dashboard');
            }
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Failed to add department person');
            setSubmitting(false);
        }
    };

    const isFormValid = !Object.values(errors).some((e) => e);
    const isFormTouched = Object.values(touched).some((t) => t);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Add Department Person</h2>
                <p className="text-sm text-slate-500 mt-1">Register a new department staff member</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {submitError}
                    </div>
                )}

                <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formValues.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="John Doe"
                        className={`w-full px-3.5 py-2.5 border rounded-xl text-sm transition-colors ${
                            touched.name && errors.name ? 'border-red-500 bg-red-50' : 'border-slate-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {touched.name && errors.name && (
                        <p className="text-red-600 text-xs mt-1.5">{errors.name}</p>
                    )}
                    <p className="text-slate-400 text-xs mt-1">{formValues.name.length}/100</p>
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formValues.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="john@example.com"
                        className={`w-full px-3.5 py-2.5 border rounded-xl text-sm transition-colors ${
                            touched.email && errors.email ? 'border-red-500 bg-red-50' : 'border-slate-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {touched.email && errors.email && (
                        <p className="text-red-600 text-xs mt-1.5">{errors.email}</p>
                    )}
                    <p className="text-slate-400 text-xs mt-1">{formValues.email.length}/100</p>
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Phone <span className="text-slate-400">(optional)</span>
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formValues.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="+1 (555) 123-4567"
                        className={`w-full px-3.5 py-2.5 border rounded-xl text-sm transition-colors ${
                            touched.phone && errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {touched.phone && errors.phone && (
                        <p className="text-red-600 text-xs mt-1.5">{errors.phone}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="department_id" className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Department <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="department_id"
                        name="department_id"
                        value={formValues.department_id}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3.5 py-2.5 border rounded-xl text-sm transition-colors ${
                            touched.department_id && errors.department_id ? 'border-red-500 bg-red-50' : 'border-slate-200'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                        <option value="">Select a department</option>
                        {(IS_DEMO ? demoStore.getDepartments() : departments).map((dept: { id: string; name: string }) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                    {touched.department_id && errors.department_id && (
                        <p className="text-red-600 text-xs mt-1.5">{errors.department_id}</p>
                    )}
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => setCurrentView('dashboard')}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!isFormValid || submitting}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {submitting ? 'Adding...' : 'Add Person'}
                    </button>
                </div>
            </form>
        </div>
    );
}
