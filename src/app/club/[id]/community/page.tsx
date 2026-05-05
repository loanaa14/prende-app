import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  Pin,
  Trash,
  Megaphone,
} from "lucide-react";
import {
  createPost,
  getPosts,
  togglePin,
  deletePost,
} from "./actions";

export default async function CommunityPage({ params }: any) {
  const id = params.id;
  const posts = await getPosts(id);

  return (
    <main className="prende-page">
      <div className="prende-container">
        <Link href={`/club/${id}/admin`} className="prende-back">
          <ArrowLeft size={16} />
          Volver
        </Link>

        <section className="prende-hero">
          <div className="prende-icon-box">
            <MessageSquare size={22} />
          </div>

          <h1 className="prende-title">Comunidad</h1>

          <p className="prende-subtitle">
            Comunicación privada del club con socios.
          </p>
        </section>

        <section className="prende-card mt-6">
          <form action={createPost} className="space-y-3">
            <input type="hidden" name="club_id" value={id} />

            <textarea
              name="content"
              placeholder="Escribí un aviso o publicación..."
              className="prende-textarea"
              required
            />

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_announcement" />
              Marcar como aviso importante
            </label>

            <button className="prende-btn">Publicar</button>
          </form>
        </section>

        <section className="prende-section">
          {posts.length === 0 ? (
            <div className="prende-empty">No hay publicaciones.</div>
          ) : (
            <div className="prende-grid">
              {posts.map((post: any) => (
                <div
                  key={post.id}
                  className={`prende-card ${
                    post.is_announcement ? "border-yellow-300 bg-yellow-50" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      {post.is_announcement && (
                        <span className="text-xs font-bold text-yellow-700 flex items-center gap-1">
                          <Megaphone size={14} />
                          Aviso importante
                        </span>
                      )}

                      <p className="mt-2">{post.content}</p>

                      <p className="text-xs text-gray-400 mt-3">
                        {new Date(post.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <form action={togglePin}>
                        <input type="hidden" name="id" value={post.id} />
                        <input type="hidden" name="club_id" value={id} />
                        <input
                          type="hidden"
                          name="is_pinned"
                          value={post.is_pinned}
                        />

                        <button>
                          <Pin size={16} />
                        </button>
                      </form>

                      <form action={deletePost}>
                        <input type="hidden" name="id" value={post.id} />
                        <input type="hidden" name="club_id" value={id} />

                        <button className="text-red-500">
                          <Trash size={16} />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}