// Seed sample Doctors + Medicines
// Add your product names + images here  +///add here

export const doctors = [
  {
    name: "Dr. S. Kumar",
    email: "doctor1@gov.in",
    specialty: "General Medicine",
    hospital: "Government District Hospital",
    fee: 100,
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=60",
    bio: "Treats fever, diabetes, BP and general health issues.",
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    availableSlots: ["10:00", "10:30", "11:00", "11:30", "14:00", "14:30"],
  },
  {
    name: "Dr. A. Priya",
    email: "doctor2@gov.in",
    specialty: "Gynecology",
    hospital: "Government Women & Child Hospital",
    fee: 150,
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=60",
    bio: "Women health, pregnancy care, and consultations.",
    availableDays: ["Mon", "Wed", "Fri"],
    availableSlots: ["09:30", "10:00", "10:30", "11:00"],
  },
];

export const products = [
  {
    name: "Paracetamol 650mg (Strip of 15)",
    category: "Fever & Pain",
    price: 30,
    mrp: 35,
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=60",
    description: "For fever and mild pain relief.",
    inStock: true,
  },
  {
    name: "ORS Sachet",
    category: "Digestive Care",
    price: 20,
    mrp: 25,
    imageUrl: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=60",
    description: "Oral rehydration salts.",
    inStock: true,
  },

  // +///add here : Add more medicines like this
  // {
  //   name: "Your Medicine Name",
  //   category: "Category Name",
  //   price: 0,
  //   mrp: 0,
  //   imageUrl: "https://... (or /images/yourfile.png)",
  //   description: "Short description",
  //   inStock: true,
  // },
];
