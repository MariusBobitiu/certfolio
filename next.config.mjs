/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  output: "standalone",
  deploymentId: process.env.DEPLOYMENT_VERSION,
}

export default nextConfig
