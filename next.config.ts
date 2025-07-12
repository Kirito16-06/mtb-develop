import { NextConfig } from "next";

const nextConfig: NextConfig = {
   async redirects() {
    return [
      {
    source: "/blog/the-missing-link-in-modern-solopreneurship-a-4-pillar-path-to-wholeness-and-impact",
    destination: "/blog/cmbjiozac0000l404ulvh6jum-the-missing-link-in-modern-solopreneurship-a-4-pillar-path-to-wholeness-and-impact",
    permanent: true
  },
  {
    source: "/blog/9-surprising-ways-neurodivergent-brains-navigate-solopreneur-life-differently",
    destination: "/blog/cma7v9nx50000l804tpkl6fra-9-surprising-ways-neurodivergent-brains-navigate-solopreneur-life-differently",
    permanent: true
  },
   {
    source: "/blog/why-logging-your-daily-wins-and-miracles-can-transform-your-solopreneur-journey",
    destination: "/blog/cma2g4vpy0001l704vgqs4sas-why-logging-your-daily-wins-and-miracles-can-transform-your-solopreneur-journey",
    permanent: true
  },
   {
    source: "/blog/biggest-challenges-faced-by-solopreneurs",
    destination: "/blog/cma2fyay10000jp04shkb9zub-biggest-challenges-faced-by-solopreneurs",
    permanent: true
  },
   {
    source: "/blog/benefits-of-joining-solopreneur-communities",
    destination: "/blog/cma2fw4lp0000l704els0oyd7-benefits-of-joining-solopreneur-communities",
    permanent: true
  },
  {
    source: "/blog/how-to-find-accountability-partners-as-a-solopreneur",
    destination: "/blog/cma2fug9w0000js04hem2nxlw-how-to-find-accountability-partners-as-a-solopreneur",
    permanent: true
  },
  {
    source: "/blog/how-to-use-ai-in-2025-to-streamline-solopreneur-tasks",
    destination: "/blog/cma2fs3ym0001jr0bnpbt3w5r-how-to-use-ai-in-2025-to-streamline-solopreneur-tasks",
    permanent: true
  },
   {
    source: "/blog/best-practices-for-freelance-solopreneurs",
    destination: "/blog/cma2fnql10000jr0blkukwkus-best-practices-for-freelance-solopreneurs",
    permanent: true
  },
   {
    source: "/blog/solopreneurship-for-creative-professionals",
    destination: "/blog/cma2flsmd0000li04it6fdpbt-solopreneurship-for-creative-professionals",
    permanent: true
  },
      {
        source: "/blog/tech-trends-every-solopreneur-should-know",
        destination: "/blog/cma2fq93s0001li042pobwsfk-tech-trends-every-solopreneur-should-know",
        permanent: true,
      },
      {
        source: "/blog/building-confidence-as-a-solopreneur",
        destination: "/blog/cma2g0njo0002li04lvwry1yt-building-confidence-as-a-solopreneur",
        permanent: true,
      },
      {
        source: "/blog/time-management-strategies-for-solopreneurs",
        destination: "/blog/cma2f7ipk0002jt04bnpm5res-time-management-strategies-for-solopreneurs",
        permanent: true,
      },
      {
        source: "/blog/how-to-set-prices-as-a-solopreneur",
        destination: "/blog/cma2fgyx10004jt04xtfz2ftz-how-to-set-prices-as-a-solopreneur",
        permanent: true,
      },
      {
        source: "/blog/how-to-grow-your-solopreneur-business-organically",
        destination: "/blog/cma2fdibe0000lb04jjett8dv-how-to-grow-your-solopreneur-business-organically",
        permanent: true,
      },
      {
        source: "/blog/why-solopreneurs-are-shaping-the-future-of-work",
        destination: "/blog/cma2g7d1t0000l104ia1zl0xy-why-solopreneurs-are-shaping-the-future-of-work",
        permanent: true,
      },
      {
        source: "/blog/marketing-strategies-for-solopreneurs",
        destination: "/blog/cma2fae7n0003jt04cvwb7gqj-marketing-strategies-for-solopreneurs",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.SUPABASE_HOST_URL ?? "", // Ensure a string
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Ensure a string
      },
    ],
  },
  experimental: {
    serverActions: {},
  },
  transpilePackages: ["@tinymce/tinymce-react"],
};

export default nextConfig;
