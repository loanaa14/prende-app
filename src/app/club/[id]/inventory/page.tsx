import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClubTheme } from "@/lib/supabase/getClubTheme";
import {
  BarChart3,
  Boxes,
  Cannabis,
  CreditCard,
  FlaskConical,
  Home,
  Lightbulb,
  MessageCircle,
  Plus,
  Settings,
  Sprout,
  Users,
  Wrench,
} from "lucide-react";

const categories = [
  { value: "genetica", label: "Genética" },
  { value: "producto_final", label: "Producto final" },
  { value: "cultivo", label: "Cultivo" },
  { value: "insumo", label: "Insumo" },
  { value: "equipo", label: "Equipamiento" },
  { value: "maquinaria", label: "Maquinaria" },
];
const images = {
  genetica: "/genetica.png",

  cultivo: "/cultivo.png",

  insumo: "/sustratos.png",

  equipo: "/maquinaria.png",
};

export default async function InventoryPage({ params, searchParams }: any) {
  const { id } = await params;
  const query = await searchParams;

  const supabase = await createClient();

  async function addInventoryItem(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const name = String(formData.get("name") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const quantity = Number(formData.get("quantity") || 0);
    const unit = String(formData.get("unit") || "unidad").trim();
    const notes = String(formData.get("notes") || "").trim();

    if (!name || !category || quantity < 0) {
      redirect(`/club/${id}/inventory?error=invalid`);
    }

    const { error } = await supabase.from("inventory_items").insert({
      club_id: id,
      name,
      category,
      quantity,
      unit,
      notes,
      status: "activo",
    });

    if (error) {
      console.error("INVENTORY INSERT ERROR:", error);
      redirect(`/club/${id}/inventory?error=insert`);
    }

    revalidatePath(`/club/${id}/inventory`);
    redirect(`/club/${id}/inventory?success=created`);
  }

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", id)
    .single();

  const { data: items } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("club_id", id)
    .order("created_at", { ascending: false });

  const theme = await getClubTheme(id);
  const clubName = theme.name || club?.name || "Club";

  const genetics = items?.filter((i: any) => i.category === "genetica") || [];
  const finalProducts =
    items?.filter((i: any) => i.category === "producto_final") || [];
  const cultivation = items?.filter((i: any) => i.category === "cultivo") || [];
  const supplies = items?.filter((i: any) => i.category === "insumo") || [];
  const equipment =
    items?.filter(
      (i: any) => i.category === "equipo" || i.category === "maquinaria"
    ) || [];

  const marijuanaAvailable =
    [...genetics, ...finalProducts]
      .filter((i: any) => i.unit === "g")
      .reduce((acc: number, i: any) => acc + Number(i.quantity || 0), 0) || 0;

  const plantsActive =
    cultivation.reduce(
      (acc: number, i: any) => acc + Number(i.quantity || 0),
      0
    ) || 0;

  return (
    <main style={page}>
      <aside style={sidebar}>
        <div>
          <div style={brand}>Prendé</div>

          <nav style={nav}>
            <Nav href={`/club/${id}`} icon={<Home size={16} />} text="Panel" />
            <Nav href={`/club/${id}/members`} icon={<Users size={16} />} text="Socios" />
            <Nav href={`/club/${id}/payments`} icon={<CreditCard size={16} />} text="Pagos" />
            <Nav href={`/club/${id}/inventory`} icon={<Boxes size={16} />} text="Inventario" active />
            <Nav href={`/club/${id}/community`} icon={<MessageCircle size={16} />} text="Comunidad" />
            <Nav href={`/club/${id}/payments`} icon={<BarChart3 size={16} />} text="Reportes" />
            <Nav href={`/club/${id}/settings`} icon={<Settings size={16} />} text="Ajustes" />
          </nav>
        </div>

        <div style={clubMini}>
          <div style={avatar}>{clubName.slice(0, 2).toUpperCase()}</div>

          <div>
            <p style={clubMiniTitle}>{clubName}</p>
            <p style={clubMiniText}>Administrador</p>
          </div>
        </div>
      </aside>

      <section style={content}>
        <header style={header}>
          <div>
            <h1 style={title}>Inventario</h1>
            <p style={subtitle}>
              Gestioná todo el stock del club en un solo lugar.
            </p>
          </div>

          <details style={actionsDropdown}>
            <summary style={actionsSummary}>
              <Plus size={15} />
              Agregar ítem
            </summary>

            <form action={addInventoryItem} style={quickForm}>
              <input
                name="name"
                required
                placeholder="Nombre del ítem"
                style={input}
              />

              <div style={formRow}>
                <select name="category" defaultValue="genetica" style={input}>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value} style={option}>
                      {cat.label}
                    </option>
                  ))}
                </select>

                <select name="unit" defaultValue="g" style={input}>
                  <option value="g" style={option}>
                    g
                  </option>
                  <option value="unidad" style={option}>
                    unidad
                  </option>
                  <option value="ml" style={option}>
                    ml
                  </option>
                  <option value="l" style={option}>
                    l
                  </option>
                  <option value="kg" style={option}>
                    kg
                  </option>
                </select>
              </div>

              <input
                name="quantity"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="Cantidad"
                style={input}
              />

              <textarea
                name="notes"
                placeholder="Notas opcionales"
                style={textarea}
              />

              <button type="submit" style={submitButton}>
                Guardar ítem
              </button>
            </form>
          </details>
        </header>

        {query?.success === "created" && (
          <p style={successBox}>Ítem agregado correctamente.</p>
        )}

        {query?.error && (
          <p style={errorBox}>No se pudo guardar. Revisá permisos o datos.</p>
        )}

        <section style={kpiGrid}>
          <Kpi
            icon={<Cannabis size={21} />}
            title="Marihuana disponible"
            value={`${marijuanaAvailable}g`}
            sub={`${genetics.length} genéticas`}
          />

          <Kpi
            icon={<Sprout size={21} />}
            title="Plantas activas"
            value={plantsActive}
            sub="En cultivo"
          />

          <Kpi
            icon={<FlaskConical size={21} />}
            title="Insumos"
            value={supplies.length}
            sub="Registrados"
          />

          <Kpi
            icon={<Lightbulb size={21} />}
            title="Equipamiento"
            value={equipment.length}
            sub="Total registrado"
          />
        </section>

        <section style={cardsGrid}>
          <InventoryCard
            icon={<Cannabis size={27} />}
            title="Genéticas"
            subtitle="Flores y variedades"
            image={images.genetica}
            items={genetics}
            fallback={[
              ["AK-47", "320g"],
              ["Gorilla Glue", "90g"],
              ["Lemon Haze", "210g"],
            ]}
            empty="No hay genéticas cargadas."
            footer="Ver todas las genéticas"
          />

          <InventoryCard
            icon={<Sprout size={27} />}
            title="Cultivo"
            subtitle="Plantas y etapas"
            image={images.cultivo}
            items={cultivation}
            fallback={[
              ["Floración", "28"],
              ["Vegetación", "15"],
              ["Secado", "5"],
            ]}
            empty="No hay cultivo cargado."
            footer="Ver cultivo"
          />

          <InventoryCard
            icon={<FlaskConical size={27} />}
            title="Insumos"
            subtitle="Fertilizantes, sustratos y más"
            image={images.insumo}
            items={supplies}
            fallback={[
              ["Fertilizantes", "8"],
              ["Sustratos", "4"],
              ["Varios", "6"],
            ]}
            empty="No hay insumos cargados."
            footer="Ver insumos"
          />

          <InventoryCard
            icon={<Wrench size={27} />}
            title="Equipamiento"
            subtitle="Luces, extractores y herramientas"
            image={images.equipo}
            items={equipment}
            fallback={[
              ["Luces", "4"],
              ["Extractores", "3"],
              ["Herramientas", "5"],
            ]}
            empty="No hay equipamiento cargado."
            footer="Ver equipamiento"
          />
        </section>
      </section>
    </main>
  );
}

function InventoryCard({
  icon,
  title,
  subtitle,
  image,
  items,
  fallback,
  empty,
  footer,
}: any) {
  const displayItems =
    items?.length > 0
      ? items.slice(0, 4).map((item: any) => [
          item.name,
          `${item.quantity}${item.unit}`,
        ])
      : fallback;

  return (
    <div style={inventoryCard}>
      <div style={cardTop}>
        <div style={cardIcon}>{icon}</div>

        <div>
          <h2 style={cardTitle}>{title}</h2>
          <p style={cardSubtitle}>{subtitle}</p>
        </div>
      </div>

      <div
        style={{
          ...imageBox,
          backgroundImage: `linear-gradient(180deg, rgba(5,5,5,0.02), rgba(5,5,5,0.58)), url(${image})`,
        }}
      />

      <div style={itemList}>
        {displayItems?.map(([name, qty]: any) => (
          <div key={name} style={itemRow}>
            <span style={itemName}>{name}</span>
            <strong style={itemQty}>{qty}</strong>
          </div>
        ))}

        {!displayItems?.length && <p style={emptyText}>{empty}</p>}
      </div>

      <p style={footerLink}>{footer} ›</p>
    </div>
  );
}

function Kpi({ icon, title, value, sub }: any) {
  return (
    <div style={kpiCard}>
      <div style={kpiIcon}>{icon}</div>

      <div>
        <p style={kpiTitle}>{title}</p>
        <p style={kpiValue}>{value}</p>
        <p style={kpiSub}>{sub}</p>
      </div>
    </div>
  );
}

function Nav({ href, icon, text, active }: any) {
  return (
    <Link href={href} style={active ? navActive : navItem}>
      {icon}
      {text}
    </Link>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#050505",
  color: "#FFFFFF",
  display: "grid",
  gridTemplateColumns: "230px 1fr",
};

const sidebar: React.CSSProperties = {
  background: "#070707",
  borderRight: "1px solid rgba(255,255,255,0.08)",
  padding: 22,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const brand: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 950,
  marginBottom: 30,
};

const nav: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const navItem: React.CSSProperties = {
  color: "#B8B8B8",
  textDecoration: "none",
  display: "flex",
  gap: 12,
  alignItems: "center",
  padding: "11px 13px",
  borderRadius: 13,
  fontWeight: 800,
  fontSize: 13,
};

const navActive: React.CSSProperties = {
  ...navItem,
  color: "#8BE000",
  background: "rgba(139,224,0,0.12)",
};

const clubMini: React.CSSProperties = {
  display: "flex",
  gap: 11,
  alignItems: "center",
};

const avatar: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 999,
  background: "#111",
  border: "1px solid rgba(139,224,0,0.28)",
  display: "grid",
  placeItems: "center",
  color: "#8BE000",
  fontWeight: 900,
  fontSize: 12,
};

const clubMiniTitle: React.CSSProperties = {
  margin: 0,
  color: "#FFFFFF",
  fontWeight: 850,
  fontSize: 13,
};

const clubMiniText: React.CSSProperties = {
  margin: "3px 0 0",
  color: "#8B8B8B",
  fontSize: 11,
};

const content: React.CSSProperties = {
  padding: 26,
  background:
    "radial-gradient(circle at top right, rgba(139,224,0,0.12), transparent 30%), #050505",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 20,
  gap: 18,
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 31,
  fontWeight: 950,
  letterSpacing: "-0.7px",
};

const subtitle: React.CSSProperties = {
  margin: "7px 0 0",
  color: "#9B9B9B",
  fontSize: 13,
};

const actionsDropdown: React.CSSProperties = {
  position: "relative",
};

const actionsSummary: React.CSSProperties = {
  listStyle: "none",
  background: "#8BE000",
  color: "#050505",
  borderRadius: 13,
  padding: "11px 15px",
  fontWeight: 950,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13,
};

const quickForm: React.CSSProperties = {
  position: "absolute",
  right: 0,
  top: 48,
  width: 350,
  zIndex: 10,
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 20,
  padding: 17,
  display: "grid",
  gap: 11,
  boxShadow: "0 24px 70px rgba(0,0,0,0.55)",
};

const formRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 0.7fr",
  gap: 10,
};

const input: React.CSSProperties = {
  background: "#0B0B0B",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 13,
  color: "#FFFFFF",
  padding: "12px",
  fontWeight: 800,
  outline: "none",
};

const option: React.CSSProperties = {
  background: "#111",
  color: "#FFFFFF",
};

const textarea: React.CSSProperties = {
  ...input,
  minHeight: 76,
  resize: "vertical",
};

const submitButton: React.CSSProperties = {
  background: "#8BE000",
  color: "#050505",
  border: "none",
  borderRadius: 13,
  padding: "12px",
  fontWeight: 950,
  cursor: "pointer",
};

const successBox: React.CSSProperties = {
  background: "rgba(139,224,0,0.10)",
  border: "1px solid rgba(139,224,0,0.22)",
  color: "#8BE000",
  borderRadius: 14,
  padding: 12,
  fontWeight: 850,
  fontSize: 13,
};

const errorBox: React.CSSProperties = {
  background: "rgba(255,107,107,0.10)",
  border: "1px solid rgba(255,107,107,0.22)",
  color: "#FF6B6B",
  borderRadius: 14,
  padding: 12,
  fontWeight: 850,
  fontSize: 13,
};

const kpiGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 15,
  marginBottom: 15,
};

const kpiCard: React.CSSProperties = {
  background: "linear-gradient(180deg, #151515, #101010)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: 18,
  display: "flex",
  gap: 14,
  alignItems: "center",
  minHeight: 92,
};

const kpiIcon: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 14,
  background: "rgba(139,224,0,0.12)",
  color: "#8BE000",
  display: "grid",
  placeItems: "center",
  flex: "0 0 auto",
};

const kpiTitle: React.CSSProperties = {
  margin: 0,
  color: "#D8D8D8",
  fontSize: 12,
  fontWeight: 850,
};

const kpiValue: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#FFFFFF",
  fontSize: 27,
  fontWeight: 950,
};

const kpiSub: React.CSSProperties = {
  margin: "3px 0 0",
  color: "#8BE000",
  fontSize: 11,
  fontWeight: 850,
};

const cardsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 15,
};

const inventoryCard: React.CSSProperties = {
  background: "linear-gradient(180deg, #151515, #101010)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  padding: 17,
  minHeight: 375,
  display: "flex",
  flexDirection: "column",
};

const cardTop: React.CSSProperties = {
  display: "flex",
  gap: 11,
  alignItems: "center",
  marginBottom: 13,
};

const cardIcon: React.CSSProperties = {
  color: "#8BE000",
  display: "flex",
};

const cardTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 17,
  fontWeight: 950,
};

const cardSubtitle: React.CSSProperties = {
  margin: "3px 0 0",
  color: "#8B8B8B",
  fontSize: 11,
};

const imageBox: React.CSSProperties = {
  height: 132,
  borderRadius: 17,
  backgroundSize: "cover",
  backgroundPosition: "center",
  marginBottom: 13,
  boxShadow: "inset 0 -45px 60px rgba(0,0,0,0.45)",
};

const itemList: React.CSSProperties = {
  display: "grid",
  gap: 10,
  flex: 1,
};

const itemRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  paddingBottom: 9,
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const itemName: React.CSSProperties = {
  color: "#D8D8D8",
  fontSize: 12,
};

const itemQty: React.CSSProperties = {
  color: "#8BE000",
  fontSize: 12,
};

const emptyText: React.CSSProperties = {
  color: "#777",
  fontSize: 12,
  margin: 0,
};

const footerLink: React.CSSProperties = {
  margin: "17px 0 0",
  color: "#8BE000",
  fontSize: 12,
  fontWeight: 900,
};