const skeletonStyle = {
    bgcolor: "var(--skeleton-bg)",
    "&::after": {
        background:
            "linear-gradient(90deg, transparent, var(--skeleton-wave), transparent)",
    },
};

export default skeletonStyle;