export function unwrapPaginated(data) {
  if (!data) return { items: [], count: 0 };
  if (Array.isArray(data)) return { items: data, count: data.length };
  const items = data.results ?? [];
  const count = data.count ?? items.length;
  return { items, count };
}
