import { createClient } from "@supabase/supabase-js";

const BUCKET = "capsule-media";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function ensureBucket() {
  const supabase = getServiceClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw new Error(`Storage unavailable: ${listError.message}`);
  }

  const exists = buckets?.some((bucket) => bucket.name === BUCKET);
  if (exists) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw new Error(`Failed to create storage bucket: ${createError.message}`);
  }
}

export async function uploadFile(
  path: string,
  file: Buffer | Blob,
  contentType: string
): Promise<string> {
  await ensureBucket();

  const supabase = getServiceClient();

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType,
    upsert: true,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return publicUrl;
}

export function buildMediaPath(
  userId: string,
  capsuleId: string,
  filename: string
) {
  return `${userId}/${capsuleId}/${filename}`;
}

export { BUCKET };
