import { prisma } from "./prisma";

async function main() {
  // Clean existing blogs for a fresh seed
  await prisma.blog.deleteMany({});

  const blogs = [
    // Starting as a Solopreneur
    {
      title: "How to start a solopreneur business",
      category: "Starting as a Solopreneur",
      excerpt: "A comprehensive guide to launching your solopreneur journey.",
      image: "/images/blog/start-solopreneur.jpg",
      content: `
# How to start a solopreneur business

Starting your solopreneur journey requires vision, planning, and perseverance.
Follow these steps to get started...
      `,
      readTime: "5 min read",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Solopreneur Business Ideas for 2025",
      category: "Starting as a Solopreneur",
      excerpt:
        "Innovative business ideas to kickstart your solopreneur career in 2025.",
      image: "/images/blog/solopreneur-ideas.jpg",
      content: `
# Solopreneur Business Ideas for 2025

Explore a range of ideas and strategies tailored for the upcoming market trends...
      `,
      readTime: "6 min read",
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Managing a Solopreneur Business
    {
      title: "How to Stay Organized as a Solopreneur",
      category: "Managing a Solopreneur Business",
      excerpt:
        "Learn key strategies to keep your business organized and efficient.",
      image: "/images/blog/organized-solopreneur.jpg",
      content: `
# How to Stay Organized as a Solopreneur

Discover tools, tips, and techniques to maintain order in your business operations...
      `,
      readTime: "7 min read",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Time management strategies for solopreneurs",
      category: "Managing a Solopreneur Business",
      excerpt: "Effective time management techniques to boost productivity.",
      image: "/images/blog/time-management.jpg",
      content: `
# Time management strategies for solopreneurs

Master your schedule and improve your efficiency with these proven methods...
      `,
      readTime: "5 min read",
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Growing a Solopreneur Business
    {
      title: "Marketing strategies for solopreneurs",
      category: "Growing a Solopreneur Business",
      excerpt:
        "Discover powerful marketing tactics tailored for solo entrepreneurs.",
      image: "/images/blog/marketing-strategies.jpg",
      content: `
# Marketing strategies for solopreneurs

Learn how to leverage digital marketing, content strategies, and more to grow your business...
      `,
      readTime: "6 min read",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title:
        "The Lucky Solopreneur: How to Attract Miracles in Your Solopreneurship Journey",
      category: "Growing a Solopreneur Business",
      excerpt:
        "Unlock the secrets to attracting positive outcomes and miracles.",
      image: "/images/blog/lucky-solopreneur.jpg",
      content: `
# The Lucky Solopreneur: How to Attract Miracles in Your Solopreneurship Journey

Explore mindset shifts and actionable steps to invite luck into your business journey...
      `,
      readTime: "7 min read",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "How to Grow Your Solopreneur Business Organically",
      category: "Growing a Solopreneur Business",
      excerpt: "Sustainable strategies for long-term, organic business growth.",
      image: "/images/blog/grow-organically.jpg",
      content: `
# How to Grow Your Solopreneur Business Organically

Focus on organic growth strategies that build a loyal customer base without paid ads...
      `,
      readTime: "6 min read",
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Financial Management for Solopreneurs
    {
      title: "How to Set Prices as a Solopreneur",
      category: "Financial Management for Solopreneurs",
      excerpt:
        "Learn pricing strategies to ensure profitability in your business.",
      image: "/images/blog/set-prices.jpg",
      content: `
# How to Set Prices as a Solopreneur

Effective pricing strategies are key to maintaining profitability and growth...
      `,
      readTime: "5 min read",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Budgeting for Solopreneurs",
      category: "Financial Management for Solopreneurs",
      excerpt:
        "Tips and techniques to manage your finances and budget effectively.",
      image: "/images/blog/budgeting.jpg",
      content: `
# Budgeting for Solopreneurs

Learn how to create a budget that helps you manage cash flow and plan for future growth...
      `,
      readTime: "5 min read",
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Niche-Specific Solopreneur Topics
    {
      title: "Solopreneurship for creative professionals",
      category: "Niche-Specific Solopreneur Topics",
      excerpt: "Tailored advice and strategies for creative solopreneurs.",
      image: "/images/blog/creative-solopreneur.jpg",
      content: `
# Solopreneurship for creative professionals

Explore the unique challenges and opportunities for creative professionals working solo...
      `,
      readTime: "5 min read",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Best Practices for Freelance Solopreneurs",
      category: "Niche-Specific Solopreneur Topics",
      excerpt: "Essential tips to excel as a freelance solopreneur.",
      image: "/images/blog/freelance-best-practices.jpg",
      content: `
# Best Practices for Freelance Solopreneurs

Learn best practices, from client management to self-care, to succeed as a freelancer...
      `,
      readTime: "6 min read",
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Solopreneurship and Technology
    {
      title: "Tech trends every solopreneur should know",
      category: "Solopreneurship and Technology",
      excerpt:
        "Stay updated with the latest tech trends that can impact your business.",
      image: "/images/blog/tech-trends.jpg",
      content: `
# Tech trends every solopreneur should know

From automation to digital marketing tools, discover the tech trends reshaping the landscape...
      `,
      readTime: "5 min read",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "How to Use AI in 2025 to Streamline Solopreneur Tasks",
      category: "Solopreneurship and Technology",
      excerpt:
        "Explore how artificial intelligence can optimize your workflow.",
      image: "/images/blog/ai-solopreneur.jpg",
      content: `
# How to Use AI in 2025 to Streamline Solopreneur Tasks

Learn practical ways to integrate AI tools into your daily business operations...
      `,
      readTime: "6 min read",
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Solopreneur Community and Networking
    {
      title: "How to Find Accountability Partners as a Solopreneur",
      category: "Solopreneur Community and Networking",
      excerpt:
        "Build a support network by finding the right accountability partners.",
      image: "/images/blog/accountability-partners.jpg",
      content: `
# How to Find Accountability Partners as a Solopreneur

Strategies to network effectively and build lasting accountability partnerships...
      `,
      readTime: "5 min read",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Benefits of Joining Solopreneur Communities",
      category: "Solopreneur Community and Networking",
      excerpt:
        "Discover the advantages of connecting with fellow solopreneurs.",
      image: "/images/blog/solopreneur-communities.jpg",
      content: `
# Benefits of Joining Solopreneur Communities

Learn how joining communities can provide support, networking, and collaboration opportunities...
      `,
      readTime: "5 min read",
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Solopreneurship Related Challenges and Solutions
    {
      title: "Biggest Challenges Faced by Solopreneurs",
      category: "Solopreneurship Related Challenges and Solutions",
      excerpt: "An in-depth look at the challenges and how to overcome them.",
      image: "/images/blog/challenges.jpg",
      content: `
# Biggest Challenges Faced by Solopreneurs

Explore common obstacles and discover actionable solutions for overcoming them...
      `,
      readTime: "7 min read",
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Mindset and Personal Development For Solopreneurs
    {
      title: "Building Confidence as a Solopreneur",
      category: "Mindset and Personal Development For Solopreneurs",
      excerpt: "Tips to boost your confidence and empower your journey.",
      image: "/images/blog/confidence.jpg",
      content: `
# Building Confidence as a Solopreneur

Discover mindset shifts and practical strategies to build unwavering confidence...
      `,
      readTime: "6 min read",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title:
        "Why Logging Your Daily Wins & Miracles Can Transform Your Solopreneur Journey",
      category: "Mindset and Personal Development For Solopreneurs",
      excerpt: "Unlock the transformative power of tracking daily successes.",
      image: "/images/blog/daily-wins.jpg",
      content: `
# Why Logging Your Daily Wins & Miracles Can Transform Your Solopreneur Journey

Explore the benefits of recording your daily wins and the miracles that follow...
      `,
      readTime: "7 min read",
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // MyThriveBuddy Features
    {
      title: "FAQs for Prosperity Drops Feature",
      category: "MyThriveBuddy Features",
      excerpt: "Answers to frequently asked questions about Prosperity Drops.",
      image: "/images/blog/prosperity-drops.jpg",
      content: `
# FAQs for Prosperity Drops Feature

Get insights into the functionality, benefits, and common queries regarding Prosperity Drops...
      `,
      readTime: "4 min read",
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Solopreneur Inspiration and Motivation
    {
      title: "Why Solopreneurs Are Shaping the Future of Work",
      category: "Solopreneur Inspiration and Motivation",
      excerpt: "Discover how solopreneurs are influencing the future of work.",
      image: "/images/blog/future-of-work.jpg",
      content: `
# Why Solopreneurs Are Shaping the Future of Work

Learn how the independent spirit and innovative ideas of solopreneurs are driving change in today's work environment...
      `,
      readTime: "6 min read",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Insert each blog into the database
  for (const blog of blogs) {
    await prisma.blog.create({ data: blog });
  }

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
