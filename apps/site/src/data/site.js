import { Download, Globe, HeartHandshake, ShieldCheck, Smile, Star } from "lucide-react";

export const reasons = [
  {
    icon: ShieldCheck,
    title: "Safe by design",
    text: "Simple, calm and trustworthy interfaces for both children and parents.",
  },
  {
    icon: HeartHandshake,
    title: "Parent-friendly experience",
    text: "Clarity and usability are present throughout the journey.",
  },
  {
    icon: Globe,
    title: "Global product mindset",
    text: "Visual language designed to resonate with families worldwide.",
  },
];

export const metrics = [
  { label: "Total downloads", value: "1.2M+", progress: 92, icon: Download },
  { label: "Average rating", value: "4.8/5", progress: 96, icon: Star },
  { label: "Parents choosing Qubi", value: "84K+", progress: 81, icon: Smile },
];

export const animationModes = [
  { id: "fan", label: "Fan spread" },
  { id: "depth", label: "Depth focus" },
  { id: "float", label: "Floating" },
  { id: "glide", label: "Glide slide" },
  { id: "orbit", label: "Orbit arc" },
];
