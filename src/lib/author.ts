type NamedProfile = { username: string } | null | undefined;

type AuthorSource = {
  author?: NamedProfile;
  actor?: NamedProfile;
  guest_name?: string | null;
  actor_name?: string | null;
};

export function displayAuthorName(source: AuthorSource) {
  return (
    source.author?.username ??
    source.actor?.username ??
    source.guest_name ??
    source.actor_name ??
    "名無しさん"
  );
}
