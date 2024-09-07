import getPosts from "./getPosts";

export default async function getTags() {
  const posts = await getPosts();

  const allTags = posts.flatMap((post) => post.tags || []);
  const uniqueTags = Array.from(new Set(allTags));

  return uniqueTags;
}
