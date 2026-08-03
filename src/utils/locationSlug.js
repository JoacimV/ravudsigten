export const createBaseSlug = (name) =>
    name
        .toLowerCase()
        .trim()
        .replace(/æ/g, "ae")
        .replace(/ø/g, "oe")
        .replace(/å/g, "aa")
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

export const createLocationSlug = (name, index, duplicateCount = 1) => {
    const baseSlug = createBaseSlug(name);

    if (duplicateCount <= 1) {
        return baseSlug;
    }

    return `${baseSlug}-${index + 1}`;
};