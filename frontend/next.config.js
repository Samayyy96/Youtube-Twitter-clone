/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '3001',
        pathname: 'samay928', // Your cloud name here
      },
    ],
  },
};

module.exports = nextConfig;