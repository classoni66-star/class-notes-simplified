import { createFileRoute } from "@tanstack/react-router";
import ClassoniApp from "@/components/ClassoniApp";

export const Route = createFileRoute("/")({
  component: ClassoniApp,
  head: () => ({ meta: [
    { title: "Classoni — Your course, made clear" },
    { name: "description", content: "Learn with Raven. Turn notes into clear lessons, apply concepts and practice exam questions." },
    { property: "og:title", content: "Classoni — Your course, made clear" },
    { property: "og:description", content: "Understand your course with guided lessons, real-world applications and quizzes." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
});
