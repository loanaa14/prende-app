"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getPosts(clubId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("community_posts")
    .select("*")
    .eq("club_id", clubId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET POSTS ERROR:", error);
    return [];
  }

  return data ?? [];
}

export async function createCommunityPost(formData: FormData) {
  const supabase = await createClient();

  const clubId = String(formData.get("club_id") || "");
  const content = String(formData.get("content") || "").trim();

  if (!clubId || !content) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase.from("community_posts").insert({
    club_id: clubId,
    user_id: user.id,
    content,
    is_pinned: false,
  });

  if (error) {
    console.error("CREATE COMMUNITY POST ERROR:", error);
    return;
  }

  revalidatePath(`/socio/club/${clubId}/comunidad`);
}

export async function createPost(formData: FormData) {
  return createCommunityPost(formData);
}

export async function togglePin(formData: FormData) {
  const supabase = await createClient();

  const postId = String(formData.get("id") || "");
  const clubId = String(formData.get("club_id") || "");

  if (!postId || !clubId) return;

  const { data: post } = await supabase
    .from("community_posts")
    .select("is_pinned")
    .eq("id", postId)
    .eq("club_id", clubId)
    .maybeSingle();

  if (!post) return;

  const { error } = await supabase
    .from("community_posts")
    .update({
      is_pinned: !post.is_pinned,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .eq("club_id", clubId);

  if (error) {
    console.error("TOGGLE PIN ERROR:", error);
    return;
  }

  revalidatePath(`/socio/club/${clubId}/comunidad`);
}

export async function deletePost(formData: FormData) {
  const supabase = await createClient();

  const postId = String(formData.get("id") || "");
  const clubId = String(formData.get("club_id") || "");

  if (!postId || !clubId) return;

  const { error } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", postId)
    .eq("club_id", clubId);

  if (error) {
    console.error("DELETE POST ERROR:", error);
    return;
  }

  revalidatePath(`/socio/club/${clubId}/comunidad`);
}