'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { demoStore } from '@/lib/demoStore';
import { DEMO_DEPARTMENTS, DepartmentData } from '@/lib/constants';
import InternFormModal, { InternFormValues } from '@/app/components/AddIntern/page';

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';

async function resJsonSafe<T = unknown>(res: Response): Promise<T> {
    const text = await res.text();
    try {
        return JSON.parse(text) as T;
    } catch {
        // Helps when the server returns an HTML 404/500 page
        throw new Error(`Server returned non-JSON response: ${text.slice(0, 120)}`);
    }
}

export default function AddInternPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [departments, setDepartments] = useState<DepartmentData[]>(DEMO_DEPARTMENTS);
    const [deptsLoading, setDeptsLoading] = useState(!IS_DEMO);
    const [deptsError, setDeptsError] = useState<string | null>(null);

    // Redirect non-admins
    if (user && user.role !== 'admin') {
        router.replace('/interns');
        return null;
    }

    useEffect(() => {
        if (IS_DEMO) {
            setDepartments(DEMO_DEPARTMENTS);
            setDeptsError(null);
            setDeptsLoading(false);
            return;
        }

        let cancelled = false;
        setDeptsLoading(true);
        setDeptsError(null);

        fetch('/api/departments')
            .then(async (res) => {
                if (!res.ok) {
                    const data = await resJsonSafe<{ message?: string }>(res).catch(
                        () => ({ message: undefined })
                    );
                    throw new Error(data.message || 'Failed to fetch departments');
                }
                const data = await resJsonSafe<{ departments?: DepartmentData[] }>(res);
                if (!cancelled) setDepartments(data.departments || []);
            })
            .catch((e) => {
                if (cancelled) return;
                setDeptsError(e instanceof Error ? e.message : 'Failed to fetch departments');
                setDepartments([]);
            })
            .finally(() => {
                if (!cancelled) setDeptsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    if (!IS_DEMO && deptsLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const showNoDepartments = !IS_DEMO && !deptsLoading && !deptsError && departments.length === 0;

    const handleSubmit = async (values: InternFormValues) => {
        setSubmitting(true);
        setError('');
        try {
            const payload = {
                name: values.name.trim(),
                email: values.email.trim().toLowerCase(),
                phone: values.phone || undefined,
                college: values.college.trim(),
                department_id: values.department_id,
                start_date: values.start_date,
                end_date: values.end_date || undefined,
                status: values.status,
            };

            if (IS_DEMO) {
                demoStore.create(payload);
            } else {
                // Use server-side API that calls Hasura with admin secret.
                // This avoids failing due to stale/invalid client JWT.
                const res = await fetch('/api/interns/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: payload.name,
                        email: payload.email,
                        phone: payload.phone ?? null,
                        college: payload.college,
                        department_id: payload.department_id,
                        start_date: payload.start_date,
                        end_date: payload.end_date ?? null,
                        status: payload.status,
                    }),
                });
                const data = await resJsonSafe<{ message?: string } & { credentials?: unknown }>(res).catch((e) => {
                    if (res.ok) throw e;
                    return { message: e instanceof Error ? e.message : 'Failed to add intern' };
                });
                if (!res.ok) throw new Error((data as any).message || 'Failed to add intern');
            }
            router.push('/interns');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add intern');
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <h2 className="text-2xl font-bold text-slate-800">Add New Intern</h2>
                <p className="text-sm text-slate-500 mt-1">Fill in the details to register a new intern</p>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {!IS_DEMO && deptsError && (
                <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl text-sm">
                    {deptsError}
                </div>
            )}

            {showNoDepartments && (
                <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl text-sm">
                    No departments found in Hasura. Seed the `departments` table (Neon/pgAdmin) first.
                </div>
            )}

            {/* Render form inline (no overlay) */}
            <InternFormModal
                isOpen={true}
                isInline={true}
                onClose={() => router.push('/interns')}
                onSubmit={handleSubmit}
                initialData={null}
                departments={departments}
                submitting={submitting}
            />
        </div>
    );
}
