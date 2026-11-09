export const MEAL_VISUALS = {
  breakfast: {
    label: "Breakfast",
    image: "/images/meals/breakfast.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    tag: "Morning Special",
    accent: "#c5a059",
    timeDefault: "08:00 - 10:00 AM"
  },
  lunch: {
    label: "Lunch",
    image: "/images/meals/lunch.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    tag: "Royal Thali",
    accent: "#0e7c66",
    timeDefault: "12:00 - 02:00 PM"
  },
  snacks: {
    label: "Evening Snacks",
    image: "/images/meals/snacks.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    tag: "Chai & Refreshments",
    accent: "#d97706",
    timeDefault: "05:00 - 06:00 PM"
  },
  dinner: {
    label: "Dinner",
    image: "/images/meals/dinner.jpg",
    fallbackUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
    tag: "Gourmet Dinner",
    accent: "#4f46e5",
    timeDefault: "07:30 - 09:30 PM"
  }
};

export function getMealVisual(category) {
  const key = (category || "").toLowerCase();
  return MEAL_VISUALS[key] || MEAL_VISUALS.lunch;
}

