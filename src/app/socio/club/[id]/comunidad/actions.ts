"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export async function createCommunityPost(formData: FormData) {
  const supabase = createServerComponentClient({ cookies });

  const clubId = formData.get("club_id") as string;
  const content = formData.get("content") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !clubId || !content.trim()) return;

  await supabase.from("community_posts").insert({
    club_id: clubId,
    user_id: user.id,
    content: content.trim(),
  });

  revalidatePath(`/socio/club/${clubId}/comunidad`);
}

export async function toggleCommunityLike(formData: FormData) {
  const supabase = createServerComponentClient({ cookies });

  const postId = formData.get("post_id") as string;
  const clubId = formData.get("club_id") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !postId) return;

  const { data: existingLike } = await supabase
    .from("community_post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingLike) {
    await supabase
      .from("community_post_likes")
      .delete()
      .eq("id", existingLike.id);
  } else {
    await supabase.from("community_post_likes").insert({
      post_id: postId,
      user_id: user.id,
    });
  }

  revalidatePath(`/socio/club/${clubId}/comunidad`);
}

export async function createCommunityComment(formData: FormData) {
  const supabase = createServerComponentClient({ cookies });

  const postId = formData.get("post_id") as string;
  const clubId = formData.get("club_id") as string;
  const content = formData.get("content") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !postId || !content.trim()) return;

  await supabase.from("community_comments").insert({
    post_id: postId,
    user_id: user.id,
    content: content.trim(),
  });

  revalidatePath(`/socio/club/${clubId}/comunidad`);
}