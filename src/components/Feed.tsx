import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function Feed({ clubId }: { clubId: string }) {
  const supabase = createServerComponentClient({ cookies });

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("club_id", clubId)
    .order("created_at", { ascending: false });

  return (
    <div className="mt-6 space-y-4">
      {posts?.map((post) => (
        <div key={post.id} className="bg-zinc-900 p-4 rounded-xl">
          <p>{post.content}</p>

          {post.image_url && (
            <img src={post.image_url} className="mt-2 rounded-lg" />
          )}

          <div className="flex gap-4 mt-2 text-sm text-gray-400">
            <span>👍 Me gusta</span>
            <span>💬 Comentar</span>
          </div>
        </div>
      ))}
    </div>
  );
}