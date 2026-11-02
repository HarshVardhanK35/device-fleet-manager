import { Cake, Hand, Star, Trophy } from "lucide-react";

// Sample content for the landing live demo, one set per use case (the
// chooser's values). Each set feeds the three demo screens: a status board,
// a notice board and an event card. status: "in" | "low" | "out";
// tag is an optional discount chip.
// Used by: demo/LiveDemo.jsx, demo/DemoScreens.jsx.

export const CARD_TYPES = {
  birthday: { label: "Birthday", icon: Cake },
  welcome: { label: "Welcome", icon: Hand },
  congrats: { label: "Congratulations", icon: Trophy },
  milestone: { label: "Milestone", icon: Star },
};

export const DEMO_DATA = {
  "Café": {
    board: {
      title: "Café menu",
      items: [
        { name: "Flat white", status: "in" },
        { name: "Iced latte", status: "in" },
        { name: "Oat milk", status: "low" },
        { name: "Almond croissant", status: "low" },
        { name: "Banana bread", status: "out" },
        { name: "Cold brew", status: "in", tag: "-20%" },
      ],
      banner: "Fresh banana bread is back at 3 pm",
    },
    notice: {
      urgent: "Machine 2 is down. Please order at the counter.",
      warning: "The kitchen closes at 4 pm today",
      info: "Free Wi-Fi: ask at the counter for the code",
    },
    card: { type: "birthday", title: "Happy birthday, Maya!", message: "Cake in the back room at 3 pm", badge: "Today", initial: "M" },
  },
  Restaurant: {
    board: {
      title: "Today's specials",
      items: [
        { name: "Grilled salmon", status: "in" },
        { name: "Mushroom risotto", status: "in" },
        { name: "Lamb shank", status: "low" },
        { name: "Tiramisu", status: "low" },
        { name: "Fish soup", status: "out" },
        { name: "Garden salad", status: "in", tag: "-15%" },
      ],
      banner: "The kitchen closes at 10 pm",
    },
    notice: {
      urgent: "Allergy alert: no nuts at table 12",
      warning: "Fully booked from 7 pm tonight",
      info: "Ask your server about our wine pairing",
    },
    card: { type: "welcome", title: "Welcome, Daniel!", message: "Our new head chef starts today", badge: "Today", initial: "D" },
  },
  Clinic: {
    board: {
      title: "Services today",
      items: [
        { name: "Walk-in clinic", status: "in" },
        { name: "Blood tests", status: "in" },
        { name: "X-ray", status: "low" },
        { name: "Dental check-up", status: "low" },
        { name: "Vaccinations", status: "out" },
        { name: "Flu shots", status: "in" },
      ],
      banner: "Current wait: about 15 minutes",
    },
    notice: {
      urgent: "Please wear a mask in the waiting room",
      warning: "Dr. Rao is running 20 minutes late",
      info: "Please wash your hands before you sit down",
    },
    card: { type: "congrats", title: "Congratulations, Dr. Patel!", message: "10 years with our clinic", badge: "Today", initial: "P" },
  },
  Gym: {
    board: {
      title: "Classes today",
      items: [
        { name: "Spin, 6 pm", status: "in" },
        { name: "Yoga, 7 pm", status: "in" },
        { name: "HIIT, 8 pm", status: "low" },
        { name: "Boxing, 9 pm", status: "out" },
        { name: "Pool", status: "in" },
        { name: "Sauna", status: "low" },
      ],
      banner: "The sauna closes at 9 pm",
    },
    notice: {
      urgent: "The pool is closed for cleaning until 3 pm",
      warning: "Locker room 2 is full. Use room 1.",
      info: "Please bring a towel to every class",
    },
    card: { type: "milestone", title: "100 visits, Sam!", message: "You hit 100 workouts this year", badge: "Today", initial: "S" },
  },
  Office: {
    board: {
      title: "Rooms today",
      items: [
        { name: "Room A", status: "in" },
        { name: "Room B", status: "in" },
        { name: "Room C", status: "low" },
        { name: "Boardroom", status: "out" },
        { name: "Focus pod", status: "in" },
        { name: "Phone booth", status: "low" },
      ],
      banner: "All-hands at 3 pm in the main hall",
    },
    notice: {
      urgent: "Fire drill at 11 am. Meet at the car park.",
      warning: "The printer on floor 2 is out of service",
      info: "Lunch is served on the 4th floor",
    },
    card: { type: "welcome", title: "Welcome, Priya!", message: "Come and say hi at the team lunch", badge: "Today", initial: "P" },
  },
  School: {
    board: {
      title: "Lunch menu",
      items: [
        { name: "Veg pasta", status: "in" },
        { name: "Chicken wrap", status: "in" },
        { name: "Fruit cup", status: "low" },
        { name: "Milk", status: "low" },
        { name: "Pizza slice", status: "out" },
        { name: "Salad bar", status: "in" },
      ],
      banner: "Lunch is served from 12 to 1 pm",
    },
    notice: {
      urgent: "Early dismissal today at 1 pm",
      warning: "The library is closed this afternoon",
      info: "Sports day is on Friday. Wear your house colour.",
    },
    card: { type: "congrats", title: "Congratulations, Class 5B!", message: "Winners of the science fair", badge: "Today", initial: "5B" },
  },
};
