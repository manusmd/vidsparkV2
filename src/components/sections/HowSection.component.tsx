"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: 1,
    title: "Enter Your Idea",
    description: "Provide your video concept, script, or creative direction.",
    gradient: "from-blue-500 to-purple-500",
    src: "/screenshots/create.png",
  },
  {
    number: 2,
    title: "AI Generation",
    description:
      "Our AI processes your input and generates a short, compelling video.",
    gradient: "from-purple-500 to-pink-500",
    // Optionally add a screenshot source here
  },
  {
    number: 3,
    title: "Customize & Share",
    description:
      "Fine-tune the video, add branding, and share with your audience.",
    gradient: "from-yellow-500 to-orange-500",
    // Optionally add a screenshot source here
  },
];

const itemVariants = {
  active: { opacity: 1, scale: 1 },
  inactive: { opacity: 0.5, scale: 0.95 },
};

export default function HowSection() {
  return (
    <motion.section
      className="z-10 mt-20 max-w-6xl mx-auto px-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8 }}
    >
      <h2 className="text-4xl font-bold mb-6 text-white">How It Works</h2>
      <p className="text-lg opacity-80 max-w-3xl mx-auto mb-10 text-gray-300">
        Simply enter your video ideas or script, and our AI will generate a
        short video complete with voiceover and visuals. Customize the style and
        branding, and you’re ready to share!
      </p>

      {/* Carousel container */}
      <Carousel className="w-full max-w-4xl mx-auto">
        <CarouselContent className="-ml-1 flex items-center">
          {steps.map((step) => (
            <CarouselItem
              key={step.number}
              // Ensures one item per view, no forced height
              className="pl-1 w-full flex-shrink-0 relative"
            >
              <motion.div
                className="p-1"
                variants={itemVariants}
                initial="inactive"
                animate="active"
                transition={{ duration: 0.3 }}
              >
                {/* Gradient border wrapper */}
                <div
                  className={`bg-gradient-to-r ${step.gradient} p-1 rounded-xl`}
                >
                  <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all hover:shadow-2xl">
                    <CardContent className="text-left p-6 flex flex-col">
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 h-12 w-12 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center justify-center rounded-full font-bold mr-4">
                          {step.number}
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {step.description}
                      </p>
                      {/* Screenshot area */}
                      {step.src ? (
                        <div className="w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                          <Image
                            src={step.src}
                            alt="Screenshot"
                            width={1280} // Example width
                            height={720} // Example height
                            className="object-cover w-full h-auto"
                            sizes="(max-width: 768px) 100vw,
                                   (max-width: 1200px) 50vw,
                                   33vw"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-64 rounded-lg overflow-hidden flex items-center justify-center bg-gray-300 dark:bg-gray-600 border border-gray-300 dark:border-gray-600">
                          <span className="text-gray-700 dark:text-gray-200 text-sm">
                            Screenshot Placeholder
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </motion.section>
  );
}
