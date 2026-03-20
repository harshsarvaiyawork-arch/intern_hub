'use client';
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/app/context/AuthContext';
import {
    DEPARTMENTS, INTERN_STATUSES, InternData, DEMO_DEPARTMENTS,
} from '@/lib/constants';
import { demoStore } from '@/lib/demoStore';
import {
    GET_INTERNS, GET_DEPARTMENTS, GET_COLLEGES,
} from '@/graphql/queries';
import {
    INSERT_INTERN, UPDATE_INTERN, DELETE_INTERN,
} from '@/graphql/mutations';
import InternTable from '@/app/components/InternList/page';
import InternFormModal, { InternFormValues } from '@/app/components/AddIntern/page';

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';

// ── Filter bar ─────────────────────────────────────────────────────────────────
function FilterBar({
    search, setSearch,
    dept, setDept,
    college, setCollege,
    status, setStatus,
    onClear,
    colleges, showDeptFilter,
}: {
    search: string; setSearch: (v: string) => void;
    dept: string; setDept: (v: string) => void;
    college: string; setCollege: (v: string) => void;
    status: string; setStatus: (v: string) => void;
    onClear: () => void;
    colleges: string[];
    showDeptFilter: boolean;
}) {
    const hasFilter = search || dept || college || status;
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search name */}
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name…"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700"
                    />
                </div>

                {/* Department filter (admin & dept_person) */}
                {showDeptFilter && (
                    <select
                        value={dept}
                        onChange={(e) => setDept(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700"
                    >
                        <option value="">All Departments</option>
                        {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                )}

                {/* College filter */}
                <select
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700"
                >
                    <option value="">All Colleges</option>
                    {colleges.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>

                {/* Status filter */}
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700"
                >
                    <option value="">All Statuses</option>
                    {INTERN_STATUSES.map((s) => (
                        <option key={s} value={s} className="capitalize">
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {hasFilter && (
                <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-slate-500">Active filters:</span>
                    {[search && `Name: "${search}"`, dept && `Dept: ${dept}`, college && `College: "${college}"`, status && `Status: ${status}`]
                        .filter(Boolean)
                        .map((tag) => (
                            <span key={tag as string} className="inline-flex items-center bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {tag}
                            </span>
                        ))}
                    <button
                        onClick={onClear}
                        className="ml-auto text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Confirm Delete modal ───────────────────────────────────────────────────────
function DeleteModal({
    name, onConfirm, onCancel, submitting,
}: {
    name: string; onConfirm: () => void; onCancel: () => void; submitting: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.963-.833-2.732 0L3.068 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Delete intern?</h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                            This will permanently delete <span className="font-semibold">{name}</span>.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={submitting}
                        className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting…</>
                        ) : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function InternsPage() {
    const { user } = useAuth();

    // Filters
    const [search, setSearch] = useState('');
    const [dept, setDept] = useState('');
    const [college, setCollege] = useState('');
    const [status, setStatus] = useState('');

    // Modals
    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState<InternData | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    // Submitting flags
    const [formBusy, setFormBusy] = useState(false);
    const [deleteBusy, setDeleteBusy] = useState(false);

    // Toast
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    }, []);

    // ── Demo mode (local store) ──────────────────────────────────────────────────
    const [demoRefresh, setDemoRefresh] = useState(0);
    const demoInterns = useMemo(() => {
        if (!IS_DEMO) return [];
        return demoStore.getInterns({
            search: search || undefined,
            department: dept || undefined,
            college: college || undefined,
            status: status || undefined,
            role: user?.role,
            userId: user?.id,
            departmentId: user?.department_id ?? undefined,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, dept, college, status, user, demoRefresh]);
    const demoColleges = useMemo(() => IS_DEMO ? demoStore.getColleges() : [], [demoRefresh]); // eslint-disable-line react-hooks/exhaustive-deps
    const demoDepts = useMemo(() => IS_DEMO ? demoStore.getDepartments() : [], []);

    // ── Hasura GraphQL (when not demo) ───────────────────────────────────────────
    const buildWhere = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: Record<string, unknown> = {};
        if (user?.role === 'intern') where.user_id = { _eq: user.id };
        if (user?.role === 'department_person') where.department_id = { _eq: user.department_id };
        if (search) where.name = { _ilike: `%${search}%` };
        if (dept) where.department = { name: { _eq: dept } };
        if (college) where.college = { _ilike: `%${college}%` };
        if (status) where.status = { _eq: status };
        return where;
    };

    const { data: gqlData, loading: gqlLoading, error: gqlError, refetch } = useQuery(
        GET_INTERNS,
        {
            variables: { where: buildWhere(), order_by: [{ created_at: 'desc' }] },
            skip: IS_DEMO,
        }
    );
    const { data: deptData } = useQuery(GET_DEPARTMENTS, { skip: IS_DEMO });
    const { data: collegeData } = useQuery(GET_COLLEGES, { skip: IS_DEMO });

    const [insertMutation] = useMutation(INSERT_INTERN, { onCompleted: () => refetch() });
    const [updateMutation] = useMutation(UPDATE_INTERN, { onCompleted: () => refetch() });
    const [deleteMutation] = useMutation(DELETE_INTERN, { onCompleted: () => refetch() });

    // Resolve data from correct source
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gql = gqlData as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cols = collegeData as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dep = deptData as any;

    const interns = IS_DEMO ? demoInterns : (gql?.interns ?? []) as InternData[];
    const colleges = IS_DEMO ? demoColleges : (cols?.interns?.map((i: { college: string }) => i.college) ?? []) as string[];
    const depts = IS_DEMO ? demoDepts : (dep?.departments ?? []);
    const loading = IS_DEMO ? false : gqlLoading;
    const errorMsg = IS_DEMO ? undefined : gqlError?.message;

    // ── Handlers ─────────────────────────────────────────────────────────────────
    const handleEdit = (intern: InternData) => {
        setEditTarget(intern);
        setShowForm(true);
    };

    const handleFormSubmit = async (values: InternFormValues) => {
        setFormBusy(true);
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
                if (editTarget) {
                    demoStore.update(editTarget.id, payload);
                    showToast(`${values.name} updated successfully`);
                } else {
                    demoStore.create(payload);
                    showToast(`${values.name} added successfully`);
                }
                setDemoRefresh((n) => n + 1);
            } else {
                if (editTarget) {
                    await updateMutation({ variables: { id: editTarget.id, set: payload } });
                    showToast(`${values.name} updated successfully`);
                } else {
                    await insertMutation({ variables: { object: payload } });
                    showToast(`${values.name} added successfully`);
                }
            }
            setShowForm(false);
            setEditTarget(null);
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Operation failed', 'error');
        } finally {
            setFormBusy(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleteBusy(true);
        try {
            if (IS_DEMO) {
                demoStore.delete(deleteTarget.id);
                setDemoRefresh((n) => n + 1);
            } else {
                await deleteMutation({ variables: { id: deleteTarget.id } });
            }
            showToast(`${deleteTarget.name} deleted`);
            setDeleteTarget(null);
        } catch {
            showToast('Delete failed', 'error');
        } finally {
            setDeleteBusy(false);
        }
    };

    const clearFilters = () => {
        setSearch(''); setDept(''); setCollege(''); setStatus('');
    };

    const isAdmin = user?.role === 'admin';
    const showDept = user?.role !== 'intern';

    return (
        <div className="max-w-7xl mx-auto space-y-5">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Interns</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {interns.length} intern{interns.length !== 1 ? 's' : ''} found
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => { setEditTarget(null); setShowForm(true); }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Intern
                    </button>
                )}
            </div>

            {/* Filters */}
            <FilterBar
                search={search} setSearch={setSearch}
                dept={dept} setDept={setDept}
                college={college} setCollege={setCollege}
                status={status} setStatus={setStatus}
                onClear={clearFilters}
                colleges={colleges}
                showDeptFilter={showDept}
            />

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <InternTable
                    interns={interns}
                    loading={loading}
                    error={errorMsg}
                    userRole={user?.role ?? 'intern'}
                    onEdit={handleEdit}
                    onDelete={(id, name) => setDeleteTarget({ id, name })}
                />
            </div>

            {/* Form modal */}
            <InternFormModal
                isOpen={showForm}
                onClose={() => { setShowForm(false); setEditTarget(null); }}
                onSubmit={handleFormSubmit}
                initialData={editTarget}
                departments={depts}
                submitting={formBusy}
            />

            {/* Delete modal */}
            {deleteTarget && (
                <DeleteModal
                    name={deleteTarget.name}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteTarget(null)}
                    submitting={deleteBusy}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                    {toast.type === 'success'
                        ? <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        : <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    }
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
