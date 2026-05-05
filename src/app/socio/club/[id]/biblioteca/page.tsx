"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SocioShell from "@/components/socio/SocioShell";
import { BookOpen, Search, ExternalLink, FileText } from "lucide-react";

export default function BibliotecaSocioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: clubId } = use(params);
  const supabase = createClient();

  const [club, setClub] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const { data: clubData } = await supabase
      .from("clubs")
      .select("*")
      .eq("id", clubId)
      .maybeSingle();

    setClub(clubData);

    const { data: libraryData } = await supabase
      .from("library_items")
      .select("*")
      .eq("club_id", clubId)
      .eq("is_visible", true)
      .order("created_at", { ascending: false });

    setItems(libraryData ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [clubId]);

  const categories = [
    "Todas",
    ...Array.from(new Set(items.map((item) => item.category).filter(Boolean))),
  ];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "Todas" || item.category === category;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <SocioShell clubId={clubId}>
        <p>Cargando biblioteca...</p>
      </SocioShell>
    );
  }

  return (
    <SocioShell clubId={clubId}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <section
          style={{
            background: "white",
            border: "1px solid #E5E1DA",
            borderRadius: 32,
            padding: 28,
            marginBottom: 22,
            boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 18,
                background: "#76A889",
                color: "white",
                display: "grid",
                placeItems: "center",
              }}
            >
              <BookOpen size={26} />
            </div>

            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>
                Biblioteca privada
              </p>
              <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>
                {club?.name ?? "Club"}
              </h1>
            </div>
          </div>

          <p style={{ marginTop: 14, color: "#6B7280", lineHeight: 1.5 }}>
            Contenido educativo, cultural y documentos internos compartidos por
            el club.
          </p>
        </section>

        <section
          style={{
            background: "white",
            border: "1px solid #E5E1DA",
            borderRadius: 26,
            padding: 20,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 220px",
              gap: 12,
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: 14,
                  top: 14,
                  color: "#6B7280",
                }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar contenido..."
                style={{
                  width: "100%",
                  padding: "13px 14px 13px 42px",
                  borderRadius: 16,
                  border: "1px solid #E5E1DA",
                  background: "#FBF9F6",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: "13px 14px",
                borderRadius: 16,
                border: "1px solid #E5E1DA",
                background: "#FBF9F6",
                outline: "none",
              }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </section>

        {filteredItems.length === 0 ? (
          <div
            style={{
              background: "white",
              border: "1px solid #E5E1DA",
              borderRadius: 26,
              padding: 28,
              textAlign: "center",
              color: "#6B7280",
            }}
          >
            Todavía no hay contenido visible en la biblioteca.
          </div>
        ) : (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 18,
            }}
          >
            {filteredItems.map((item) => (
              <article
                key={item.id}
                style={{
                  background: "white",
                  border: "1px solid #E5E1DA",
                  borderRadius: 28,
                  padding: 22,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 16,
                    background: "#F8F4EC",
                    color: "#76A889",
                    display: "grid",
                    placeItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <FileText size={22} />
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "#76A889",
                    fontWeight: 800,
                  }}
                >
                  {item.category || "Contenido"}
                </p>

                <h2 style={{ margin: "6px 0 8px", fontSize: 21 }}>
                  {item.title}
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#6B7280",
                    lineHeight: 1.5,
                    fontSize: 14,
                  }}
                >
                  {item.description || "Contenido interno del club."}
                </p>

                {item.content_body && (
                  <div
                    style={{
                      marginTop: 14,
                      background: "#FBF9F6",
                      border: "1px solid #E5E1DA",
                      borderRadius: 16,
                      padding: 14,
                      fontSize: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    {item.content_body}
                  </div>
                )}

                {item.content_url && (
                  <a
                    href={item.content_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      marginTop: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      width: "100%",
                      background: "#76A889",
                      color: "white",
                      borderRadius: 16,
                      padding: 12,
                      textDecoration: "none",
                      fontWeight: 800,
                      boxSizing: "border-box",
                    }}
                  >
                    Abrir contenido
                    <ExternalLink size={16} />
                  </a>
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </SocioShell>
  );
}