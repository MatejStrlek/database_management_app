export const getSortIcon = (field, sortField, sortOrder) => {
    if (sortField !== field) return ' ⇅';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
};