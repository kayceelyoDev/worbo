export function getRank(score: number) {
    if (score >= 90000) return { name: "Grande", image: "/trophies/grande.png" };
    if (score >= 90000) return { name: "Abyssal", image: "/trophies/abyssal.png" };
    if (score >= 80000) return { name: "Diamond", image: "/trophies/diamond.png" };
    if (score >= 70000) return { name: "Platinum", image: "/trophies/platinum.png" };
    if (score >= 60000) return { name: "Emerald", image: "/trophies/emerald.png" };
    if (score >= 50000) return { name: "Gold", image: "/trophies/gold.png" };
    if (score >= 40000) return { name: "Pearl", image: "/trophies/pearl.png" };
    if (score >= 30000) return { name: "Coper", image: "/trophies/coper.png" };
    if (score >= 20000) return { name: "Iron", image: "/trophies/iron.png" };
    if (score >= 10000) return { name: "Wood", image: "/trophies/wood.png" };
    return { name: "Unranked", image: "/trophies/unranked.png" };
}
