import { sanityClient } from "./client";

type Params = Record<string, unknown>;

export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
  revalidate = 60,
}: {
  query: string;
  params?: Params;
  tags?: string[];
  revalidate?: number;
}): Promise<T> {
  return sanityClient.fetch<T>(query, params, {
    next: { revalidate, tags },
  });
}
