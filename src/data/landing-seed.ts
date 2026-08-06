// Seeded example data for Elena Marin — consistent fictional example profile.
// Used across all landing page sections.

export const elena = {
  name: "Elena Marin",
  slug: "elenamarin",
  role: "Cloud & Platform Engineer",
  location: "Manchester, United Kingdom",
  headline: "Cloud and platform engineer focused on reliable infrastructure, deployment automation and observability.",
  bio: "Cloud and platform engineer focused on reliable infrastructure, deployment automation and observability. Experienced with AWS, Azure, Kubernetes, Terraform and containerised services. I build resilient systems, design scalable monitoring solutions and help teams deploy with confidence.",
  avatarUrl: null as string | null,
} as const

export const elenaCredentials = [
  {
    id: "cred-1",
    issuerDisplayName: "Amazon Web Services",
    issuerThemeKey: "aws",
    title: "AWS Certified Solutions Architect — Professional",
    issuedOn: "2024-03-15",
    verificationStatus: "verified_external" as const,
  },
  {
    id: "cred-2",
    issuerDisplayName: "Microsoft",
    issuerThemeKey: "microsoft",
    title: "Microsoft Azure Administrator Associate",
    issuedOn: "2023-09-22",
    verificationStatus: "verified_external" as const,
  },
  {
    id: "cred-3",
    issuerDisplayName: "The Linux Foundation",
    issuerThemeKey: "linux-foundation",
    title: "Certified Kubernetes Application Developer",
    issuedOn: "2024-01-20",
    verificationStatus: "self_declared" as const,
  },
] as const

export const elenaSkills = [
  "AWS", "Azure", "Kubernetes", "Terraform", "Go", "Prometheus",
  "Docker", "Linux", "CI/CD", "Helm", "Grafana", "Python",
] as const

export const elenaProjects = [
  {
    id: "proj-1",
    slug: "multi-cluster-observability",
    title: "Multi-cluster observability platform",
    summary: "Designed a unified monitoring stack across 12 EKS clusters using Prometheus, Thanos and custom Grafana dashboards. Mean time to detection dropped from 8 minutes to under 90 seconds.",
    projectType: "Platform Engineering",
    role: "Lead Engineer",
    context: "The engineering team was managing 12 EKS clusters across three environments with no unified view of system health. Incident response relied on navigating between separate Grafana instances and CloudWatch dashboards.",
    outcome: "Mean time to detection dropped from 8 minutes to under 90 seconds. The unified dashboard became the primary operational interface for the entire platform team.",
    tools: "Prometheus, Thanos, Grafana, Helm, Terraform, Go, Alertmanager, EKS",
    evidenceCount: 3,
    coverImageUrl: null as string | null,
  },
  {
    id: "proj-2",
    slug: "cost-governance-system",
    title: "Infrastructure cost governance system",
    summary: "Automated cost allocation and anomaly detection across 200+ accounts using Lambda and QuickSight. Reduced monthly infrastructure spend by 18%.",
    projectType: "Cloud Infrastructure",
    role: "Senior Engineer",
    context: "The organisation lacked visibility into per-team cloud spending across 200+ accounts, making budget accountability impossible.",
    outcome: "Reduced monthly infrastructure spend by 18% through automated tagging enforcement and anomaly detection.",
    tools: "AWS Lambda, QuickSight, Python, Terraform, EventBridge",
    evidenceCount: 2,
    coverImageUrl: null as string | null,
  },
  {
    id: "proj-3",
    slug: "automated-k8s-deployment",
    title: "Automated Kubernetes deployment workflow",
    summary: "Built a GitOps-based deployment pipeline using ArgoCD and Helm, replacing manual kubectl workflows. Reduced deployment errors by 85%.",
    projectType: "DevOps Automation",
    role: "Platform Engineer",
    context: "Manual deployments were causing frequent configuration drift between environments and slowing release velocity across 4 engineering teams.",
    outcome: "Deployment errors reduced by 85%. Time from merge to production dropped from 2 hours to 15 minutes.",
    tools: "ArgoCD, Helm, Kubernetes, GitHub Actions, Docker, Terraform",
    evidenceCount: 2,
    coverImageUrl: null as string | null,
  },
] as const

export const elenaLinks = [
  { platform: "github" as const, label: "elenamarin", url: "https://github.com/elenamarin" },
  { platform: "linkedin" as const, label: "elena-marin", url: "https://linkedin.com/in/elena-marin" },
  { platform: "website" as const, label: "elenamarin.dev", url: "https://elenamarin.dev" },
] as const
