const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/);
    if(parts.length === 0) return "";
    if(parts.length === 1) return parts[0][0].toUpperCase();
    return (
        parts[0][0].toUpperCase() + 
        parts[parts.length-1][0].toUpperCase()
    );
}

export default getInitials;