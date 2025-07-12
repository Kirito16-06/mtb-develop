import { supabaseClient } from "../supabase";

export default async function handleSupabaseImageUpload(file: File, bucket_name: string, folder_name: string): Promise<string> {
    let imageUrl = "";

    // Upload image to Supabase Storage (if provided)
    if (file) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${folder_name}/${fileName}`;

      const { data, error } = await supabaseClient.storage
        .from(bucket_name)
        .upload(filePath, file);

      if (error) throw new Error(`Supabase Upload Error: ${error.message}`);
      console.log(data);

      const { data: publicUrl } = supabaseClient.storage
        .from(bucket_name)
        .getPublicUrl(filePath);

      imageUrl = publicUrl.publicUrl; // Store this in Prisma
    }
    return imageUrl;
}