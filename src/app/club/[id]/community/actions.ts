"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const supabase = await createClient();

  const clubId = String(formData.get("club_id"));
  const content = String(formData.get("content"));

  const isAnnouncement = formData.get("is_announcement") === "on";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("posts").insert({
    club_id: clubId,
    user_id: user?.id,
    content,
    is_announcement: isAnnouncement,
  });

  revalidatePath(`/club/${clubId}/community`);
}

export async function togglePin(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  const clubId = formData.get("club_id");
  const isPinned = formData.get("is_pinned") === "true";

  await supabase
    .from("posts")
    .update({ is_pinned: !isPinned })
    .eq("id", id);

  revalidatePath(`/club/${clubId}/community`);
}

export async function deletePost(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id");
  const clubId = formData.get("club_id");

  await supabase.from("posts").delete().eq("id", id);

  revalidatePath(`/club/${clubId}/community`);
}

export async function getPosts(clubId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("club_id", clubId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  return data || [];
}