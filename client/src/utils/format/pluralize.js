export function pluralizeWord(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

export function pluralizeCount(count, singular, plural = `${singular}s`) {
  return `${count} ${pluralizeWord(count, singular, plural)}`;
}

// Same "N item/items" string-building shows up across Dashboard, Content,
// Playlists, PlaylistRow, Assignments — this was being hand-rolled as
// `${n} word${n === 1 ? "" : "s"}` in each spot. `pluralizeWord` is for the
// rarer case where only the word itself is shown (no count prefix), e.g.
// Dashboard's Online/Offline tiles.
