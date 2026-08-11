"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    getAnimals, createAnimal, updateAnimal, deleteAnimal,
    getSpecies, createSpecies, updateSpecies, deleteSpecies,
    getProducts, createProduct, updateProduct, deleteProduct,
    getTiers, createTier, updateTier, deleteTier,
    getActivities, createActivity, updateActivity, deleteActivity,
    getRanchUpdates, createRanchUpdate, updateRanchUpdate, deleteRanchUpdate,
    getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost
} from "@/lib/api";
import { 
    Animal, Species, Product, SponsorshipTier, Activity, RanchUpdate, BlogPost 
} from "@/lib/types";
import { 
    Settings, Heart, Trash, Edit, Plus, CheckCircle, AlertCircle, 
    Layers, ShoppingBag, ShieldAlert, Sparkles, BookOpen, Star, FileText
} from "lucide-react";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

export default function AdminConfigPage() {
    const { user } = useAuthStore();
    const role = user?.role || "USER";
    const isStaff = user?.is_staff || false;
    const canConfigure = role === "ADMIN" || role === "FAMILY" || isStaff;

    const [activeTab, setActiveTab] = useState<"animals" | "species" | "products" | "tiers" | "activities" | "updates" | "blog">("animals");

    // General Lists State
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [species, setSpecies] = useState<Species[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [tiers, setTiers] = useState<SponsorshipTier[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [updates, setUpdates] = useState<RanchUpdate[]>([]);
    const [posts, setPosts] = useState<BlogPost[]>([]);

    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Form Modal / Edit states
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | string | null>(null);
    const [showForm, setShowForm] = useState(false);

    // Form Field States
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (!canConfigure) return;
        loadData();
    }, [activeTab, canConfigure]);

    const loadData = async () => {
        setLoading(true);
        setErrorMessage(null);
        try {
            if (activeTab === "animals") {
                const data = await getAnimals();
                setAnimals(data);
            } else if (activeTab === "species") {
                const data = await getSpecies();
                setSpecies(data);
            } else if (activeTab === "products") {
                const data = await getProducts();
                setProducts(data);
            } else if (activeTab === "tiers") {
                const data = await getTiers();
                setTiers(data);
            } else if (activeTab === "activities") {
                const data = await getActivities();
                setActivities(data);
            } else if (activeTab === "updates") {
                const data = await getRanchUpdates();
                setUpdates(data);
            } else if (activeTab === "blog") {
                const data = await getBlogPosts();
                setPosts(data);
            }
        } catch (err) {
            console.error("Error loading data:", err);
            setErrorMessage("Error al cargar los datos de la pestaña activa.");
        } finally {
            setLoading(false);
        }
    };

    const triggerSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handleOpenCreate = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData(activeTab === "blog" ? { is_public: true, is_sponsor_only: false } : {});
        setShowForm(true);
    };

    const handleOpenEdit = (item: any) => {
        setIsEditing(true);
        setEditingId(item.id);
        setFormData({ ...item });
        setShowForm(true);
    };

    const handleDelete = async (id: number | string) => {
        if (!confirm("¿Estás seguro de eliminar este registro?")) return;
        setLoading(true);
        setErrorMessage(null);
        try {
            if (activeTab === "animals") await deleteAnimal(id as number);
            else if (activeTab === "species") await deleteSpecies(id as number);
            else if (activeTab === "products") await deleteProduct(id as number);
            else if (activeTab === "tiers") await deleteTier(id as number);
            else if (activeTab === "activities") await deleteActivity(id as number);
            else if (activeTab === "updates") await deleteRanchUpdate(id as number);
            else if (activeTab === "blog") await deleteBlogPost(id);

            triggerSuccess("Registro eliminado correctamente.");
            loadData();
        } catch (err) {
            console.error("Error deleting:", err);
            setErrorMessage("No se pudo eliminar el registro.");
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);
        try {
            if (activeTab === "animals") {
                if (isEditing && editingId) {
                    await updateAnimal(editingId as number, formData);
                } else {
                    await createAnimal(formData);
                }
            } else if (activeTab === "species") {
                if (isEditing && editingId) {
                    await updateSpecies(editingId as number, formData);
                } else {
                    await createSpecies(formData);
                }
            } else if (activeTab === "products") {
                if (isEditing && editingId) {
                    await updateProduct(editingId as number, formData);
                } else {
                    await createProduct(formData);
                }
            } else if (activeTab === "tiers") {
                if (isEditing && editingId) {
                    await updateTier(editingId as number, formData);
                } else {
                    await createTier(formData);
                }
            } else if (activeTab === "activities") {
                if (isEditing && editingId) {
                    await updateActivity(editingId as number, formData);
                } else {
                    await createActivity(formData);
                }
            } else if (activeTab === "updates") {
                if (isEditing && editingId) {
                    await updateRanchUpdate(editingId as number, formData);
                } else {
                    await createRanchUpdate(formData);
                }
            } else if (activeTab === "blog") {
                if (isEditing && editingId) {
                    await updateBlogPost(editingId, formData);
                } else {
                    await createBlogPost(formData);
                }
            }

            triggerSuccess(isEditing ? "Registro actualizado correctamente." : "Registro creado correctamente.");
            setShowForm(false);
            loadData();
        } catch (err) {
            console.error("Error submitting form:", err);
            setErrorMessage("Error al guardar los cambios del formulario.");
        } finally {
            setLoading(false);
        }
    };

    if (!canConfigure) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
                <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center text-3xl font-black">!</div>
                <h2 className="text-2xl font-black text-foreground">Acceso Denegado</h2>
                <p className="text-muted-foreground text-sm max-w-md">No tienes los permisos requeridos para ver este panel.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-2 text-foreground">
                        <Settings className="h-8 w-8 text-primary" />
                        Configuración de Aplicaciones
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Modifica los animales, productos, suscripciones, bitácoras y artículos de blog desde una sola interfaz.
                    </p>
                </div>
                <Button onClick={handleOpenCreate} className="mt-4 md:mt-0 font-bold gap-2 rounded-full">
                    <Plus className="h-4 w-4" /> Agregar Registro
                </Button>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 border-b pb-2">
                {[
                    { id: "animals", label: "Animales", icon: Sparkles },
                    { id: "species", label: "Especies", icon: Layers },
                    { id: "products", label: "Productos Tienda", icon: ShoppingBag },
                    { id: "tiers", label: "Apadrinamientos (Tiers)", icon: Heart },
                    { id: "activities", label: "Actividades", icon: Star },
                    { id: "updates", label: "Historias Rancho", icon: FileText },
                    { id: "blog", label: "Artículos Blog", icon: BookOpen }
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                setShowForm(false);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                                activeTab === tab.id
                                    ? "bg-primary text-primary-foreground shadow"
                                    : "text-muted-foreground hover:bg-muted"
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Notifications */}
            {successMessage && (
                <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    {errorMessage}
                </div>
            )}

            {/* Form Drawer (Inline Overlay) */}
            {showForm && (
                <div className="p-6 border rounded-2xl bg-card/60 backdrop-blur shadow-inner space-y-4">
                    <h3 className="text-lg font-black text-primary">
                        {isEditing ? "Modificar Registro" : "Crear Nuevo Registro"}
                    </h3>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Title / Name */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    {activeTab === "updates" || activeTab === "blog" || activeTab === "activities" ? "Título" : "Nombre"}
                                </label>
                                <Input
                                    value={formData.name || formData.title || ""}
                                    onChange={(e) => {
                                        if (activeTab === "updates" || activeTab === "blog" || activeTab === "activities") {
                                            setFormData({ ...formData, title: e.target.value });
                                        } else {
                                            setFormData({ ...formData, name: e.target.value });
                                        }
                                    }}
                                    placeholder="Nombre o Título"
                                    required
                                />
                            </div>

                            {/* Optional Slug for Blog */}
                            {activeTab === "blog" && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Slug (Opcional)</label>
                                    <Input
                                        value={formData.slug || ""}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="Generado automáticamente si se deja en blanco"
                                    />
                                </div>
                            )}

                            {/* Price for products, animals, tiers, activities */}
                            {activeTab !== "species" && activeTab !== "updates" && activeTab !== "blog" && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Precio / Cuota</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.price || ""}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        placeholder="0.00"
                                        required={activeTab !== "animals"}
                                    />
                                </div>
                            )}

                            {/* Stock for Products */}
                            {activeTab === "products" && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stock Inicial</label>
                                    <Input
                                        type="number"
                                        value={formData.stock || 0}
                                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                        placeholder="Stock"
                                        required
                                    />
                                </div>
                            )}

                            {/* Species selector for Animals */}
                            {activeTab === "animals" && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Especie</label>
                                    <select
                                        className="w-full p-2 border rounded-md bg-card text-foreground"
                                        value={formData.species || ""}
                                        onChange={(e) => setFormData({ ...formData, species: parseInt(e.target.value) })}
                                        required
                                    >
                                        <option value="">Selecciona Especie</option>
                                        <option value="1">Caballos</option>
                                        <option value="2">Perros</option>
                                        <option value="3">Gatos</option>
                                    </select>
                                </div>
                            )}

                            {/* Level for Tiers */}
                            {activeTab === "tiers" && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nivel de Acceso</label>
                                    <Input
                                        type="number"
                                        value={formData.level || ""}
                                        onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                                        placeholder="Nivel (Ej. 1, 2, 3)"
                                        required
                                    />
                                </div>
                            )}

                            {/* Capacity for Activities */}
                            {activeTab === "activities" && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Capacidad Máxima</label>
                                    <Input
                                        type="number"
                                        value={formData.max_capacity || ""}
                                        onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) })}
                                        placeholder="Cupo"
                                        required
                                    />
                                </div>
                            )}

                            {/* Minimum Tier Level for updates */}
                            {activeTab === "updates" && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nivel Mínimo Sponsor</label>
                                    <Input
                                        type="number"
                                        value={formData.min_tier_level || 0}
                                        onChange={(e) => setFormData({ ...formData, min_tier_level: parseInt(e.target.value) })}
                                        placeholder="0 para público general"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Description / Rich Content Editor */}
                        {activeTab !== "species" && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    {activeTab === "updates" || activeTab === "blog" ? "Contenido Enriquecido (Artículo/Bitácora)" : "Descripción"}
                                </label>
                                {activeTab === "updates" || activeTab === "blog" ? (
                                    <RichTextEditor
                                        value={formData.content || ""}
                                        onChange={(htmlContent) => setFormData({ ...formData, content: htmlContent })}
                                        placeholder="Escribe el artículo con formato, emojis e imágenes..."
                                    />
                                ) : (
                                    <textarea
                                        className="w-full p-2 border rounded-xl bg-card text-foreground"
                                        rows={5}
                                        value={formData.description || ""}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Detalles sobre el registro..."
                                        required
                                    />
                                )}
                            </div>
                        )}

                        {/* Blog Toggles */}
                        {activeTab === "blog" && (
                            <div className="flex flex-wrap gap-6 pt-1">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_public"
                                        checked={formData.is_public !== false}
                                        onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                                        className="w-4 h-4 rounded text-primary accent-primary"
                                    />
                                    <label htmlFor="is_public" className="text-sm font-bold">Público en Landing</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_sponsor_only"
                                        checked={!!formData.is_sponsor_only}
                                        onChange={(e) => setFormData({ ...formData, is_sponsor_only: e.target.checked })}
                                        className="w-4 h-4 rounded text-primary accent-primary"
                                    />
                                    <label htmlFor="is_sponsor_only" className="text-sm font-bold">Exclusivo Patrocinadores</label>
                                </div>
                            </div>
                        )}

                        {/* Active switch for other entities */}
                        {activeTab !== "species" && activeTab !== "updates" && activeTab !== "blog" && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active !== false}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 rounded text-primary accent-primary"
                                />
                                <label htmlFor="is_active" className="text-sm font-bold">Activo / Visible</label>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={loading} className="font-bold">
                                {loading ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="font-bold">
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Table View */}
            <div className="p-6 border rounded-[2.5rem] bg-card/10 backdrop-blur shadow-xl overflow-hidden">
                {loading ? (
                    <div className="text-center py-10 font-bold text-muted-foreground">Cargando datos...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b text-muted-foreground text-xs uppercase font-black tracking-widest">
                                    <th className="py-4 px-4">ID</th>
                                    <th className="py-4 px-4">Nombre / Título</th>
                                    {activeTab !== "species" && activeTab !== "updates" && activeTab !== "blog" && <th className="py-4 px-4">Precio</th>}
                                    {activeTab === "products" && <th className="py-4 px-4">Stock</th>}
                                    {activeTab === "tiers" && <th className="py-4 px-4">Nivel</th>}
                                    {activeTab === "updates" && <th className="py-4 px-4">Nivel Mín.</th>}
                                    {activeTab === "blog" && <th className="py-4 px-4">Autor</th>}
                                    {activeTab === "blog" && <th className="py-4 px-4">Estado</th>}
                                    {activeTab !== "species" && activeTab !== "updates" && activeTab !== "blog" && <th className="py-4 px-4">Estado</th>}
                                    <th className="py-4 px-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeTab === "animals" && animals.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-muted/10 font-medium">
                                        <td className="py-4 px-4 font-mono text-xs">#{item.id}</td>
                                        <td className="py-4 px-4 text-foreground font-bold">{item.name}</td>
                                        <td className="py-4 px-4">${item.price || "0.00"} MXN</td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.is_active ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}>
                                                {item.is_active ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(item)}><Edit className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} className="text-destructive hover:bg-destructive/10"><Trash className="h-4 w-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === "species" && species.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-muted/10 font-medium">
                                        <td className="py-4 px-4 font-mono text-xs">#{item.id}</td>
                                        <td className="py-4 px-4 text-foreground font-bold">{item.name}</td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(item)}><Edit className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} className="text-destructive hover:bg-destructive/10"><Trash className="h-4 w-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === "products" && products.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-muted/10 font-medium">
                                        <td className="py-4 px-4 font-mono text-xs">#{item.id}</td>
                                        <td className="py-4 px-4 text-foreground font-bold">{item.name}</td>
                                        <td className="py-4 px-4">${item.price} MXN</td>
                                        <td className="py-4 px-4 font-mono">{item.stock}</td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.is_active ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}>
                                                {item.is_active ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(item)}><Edit className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} className="text-destructive hover:bg-destructive/10"><Trash className="h-4 w-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === "tiers" && tiers.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-muted/10 font-medium">
                                        <td className="py-4 px-4 font-mono text-xs">#{item.id}</td>
                                        <td className="py-4 px-4 text-foreground font-bold">{item.name}</td>
                                        <td className="py-4 px-4">${item.price} MXN</td>
                                        <td className="py-4 px-4 font-mono font-bold">{item.level}</td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.is_active ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}>
                                                {item.is_active ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(item)}><Edit className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} className="text-destructive hover:bg-destructive/10"><Trash className="h-4 w-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === "activities" && activities.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-muted/10 font-medium">
                                        <td className="py-4 px-4 font-mono text-xs">#{item.id}</td>
                                        <td className="py-4 px-4 text-foreground font-bold">{item.title}</td>
                                        <td className="py-4 px-4">${item.price} MXN</td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.is_active ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}>
                                                {item.is_active ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(item)}><Edit className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} className="text-destructive hover:bg-destructive/10"><Trash className="h-4 w-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === "updates" && updates.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-muted/10 font-medium">
                                        <td className="py-4 px-4 font-mono text-xs">#{item.id}</td>
                                        <td className="py-4 px-4 text-foreground font-bold">{item.title}</td>
                                        <td className="py-4 px-4 font-mono">{item.min_tier_level}</td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(item)}><Edit className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} className="text-destructive hover:bg-destructive/10"><Trash className="h-4 w-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === "blog" && posts.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-muted/10 font-medium">
                                        <td className="py-4 px-4 font-mono text-xs">#{item.id}</td>
                                        <td className="py-4 px-4 text-foreground font-bold">
                                            {item.title}
                                            <span className="block text-xs font-mono text-muted-foreground font-normal">/{item.slug}</span>
                                        </td>
                                        <td className="py-4 px-4 text-xs text-muted-foreground">{item.author_name || item.author}</td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.is_public ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}>
                                                {item.is_public ? "Público" : "Borrador"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(item)}><Edit className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} className="text-destructive hover:bg-destructive/10"><Trash className="h-4 w-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
