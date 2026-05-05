"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getProducts(clubId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("club_id", clubId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function getMovements(clubId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_movements")
    .select(`
      *,
      products (
        name
      )
    `)
    .eq("club_id", clubId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  const clubId = String(formData.get("club_id"));
  const name = String(formData.get("name") || "").trim();
  const stock = Number(formData.get("stock") || 0);
  const lowStockThreshold = Number(formData.get("low_stock_threshold") || 5);
  const status = String(formData.get("status") || "en revisión");
  const category = String(formData.get("category") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!clubId || !name) return;

  const { error } = await supabase.from("products").insert({
    club_id: clubId,
    name,
    stock,
    low_stock_threshold: lowStockThreshold,
    status,
    category,
    notes,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error(error);
    throw new Error("No se pudo crear el registro interno");
  }

  revalidatePath(`/club/${clubId}/inventory`);
}

export async function deleteProduct(formData: FormData) {
  const supabase = await createClient();

  const clubId = String(formData.get("club_id"));
  const productId = String(formData.get("product_id"));

  if (!clubId || !productId) return;

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("club_id", clubId);

  if (error) {
    console.error(error);
    throw new Error("No se pudo eliminar el registro");
  }

  revalidatePath(`/club/${clubId}/inventory`);
}

export async function registerMovement(formData: FormData) {
  const supabase = await createClient();

  const clubId = String(formData.get("club_id"));
  const productId = String(formData.get("product_id"));
  const quantity = Number(formData.get("quantity") || 0);
  const notes = String(formData.get("notes") || "").trim();

  if (!clubId || !productId || quantity <= 0) return;

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("stock")
    .eq("id", productId)
    .eq("club_id", clubId)
    .single();

  if (productError || !product) {
    console.error(productError);
    throw new Error("No se encontró el registro interno");
  }

  const newStock = Math.max(0, Number(product.stock || 0) - quantity);

  const { error: movementError } = await supabase
    .from("product_movements")
    .insert({
      club_id: clubId,
      product_id: productId,
      type: "salida",
      quantity,
      notes,
    });

  if (movementError) {
    console.error(movementError);
    throw new Error("No se pudo registrar el movimiento");
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({
      stock: newStock,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .eq("club_id", clubId);

  if (updateError) {
    console.error(updateError);
    throw new Error("No se pudo actualizar la cantidad");
  }

  revalidatePath(`/club/${clubId}/inventory`);
}