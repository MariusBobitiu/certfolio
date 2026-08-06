import styles from "./evidence-profile-illustration.module.css"

type FragmentKind =
  | "architecture"
  | "code"
  | "document"
  | "link"
  | "project"
  | "repository"
  | "seal"
  | "terminal"

type FragmentSpec = {
  id: string
  kind: FragmentKind
  x: number
  y: number
  width: number
  height: number
  rotate?: number
  accent?: boolean
  featured?: boolean
  secondary?: boolean
  soft?: boolean
  motion?: "a" | "b" | "c"
}

type FragmentProps = Omit<FragmentSpec, "id" | "kind" | "motion">

const fragments: FragmentSpec[] = [
  {
    id: "upper-anchor-document",
    kind: "document",
    x: 198,
    y: 74,
    width: 80,
    height: 44,
    rotate: -3,
  },
  {
    id: "upper-accent-code",
    kind: "code",
    x: 289,
    y: 84,
    width: 72,
    height: 38,
    rotate: 2,
    accent: true,
  },
  {
    id: "upper-edge-repository",
    kind: "repository",
    x: 365,
    y: 111,
    width: 49,
    height: 37,
    rotate: 7,
    soft: true,
  },
  {
    id: "upper-left-project",
    kind: "project",
    x: 147,
    y: 115,
    width: 67,
    height: 47,
    rotate: -6,
  },
  {
    id: "upper-core-document",
    kind: "document",
    x: 226,
    y: 132,
    width: 69,
    height: 48,
    rotate: 1,
  },
  {
    id: "upper-architecture",
    kind: "architecture",
    x: 306,
    y: 136,
    width: 74,
    height: 43,
    rotate: -2,
    accent: true,
  },
  {
    id: "upper-left-code",
    kind: "code",
    x: 143,
    y: 177,
    width: 72,
    height: 43,
    rotate: -4,
  },
  {
    id: "upper-inner-document",
    kind: "document",
    x: 226,
    y: 187,
    width: 68,
    height: 40,
    rotate: 3,
  },
  {
    id: "identity-verification",
    kind: "seal",
    x: 302,
    y: 190,
    width: 36,
    height: 36,
    rotate: 4,
    featured: true,
  },
  {
    id: "middle-left-project",
    kind: "project",
    x: 126,
    y: 231,
    width: 64,
    height: 47,
    rotate: 4,
  },
  {
    id: "middle-architecture",
    kind: "architecture",
    x: 199,
    y: 236,
    width: 72,
    height: 44,
    rotate: -3,
  },
  {
    id: "middle-repository",
    kind: "repository",
    x: 282,
    y: 237,
    width: 56,
    height: 39,
    rotate: 2,
    accent: true,
  },
  {
    id: "profile-upper-document",
    kind: "document",
    x: 359,
    y: 184,
    width: 48,
    height: 35,
    rotate: 6,
    soft: true,
  },
  {
    id: "profile-link",
    kind: "link",
    x: 382,
    y: 232,
    width: 42,
    height: 27,
    rotate: -2,
    accent: true,
  },
  {
    id: "profile-lower-document",
    kind: "document",
    x: 351,
    y: 276,
    width: 58,
    height: 37,
    rotate: 3,
    soft: true,
  },
  {
    id: "middle-core-document",
    kind: "document",
    x: 242,
    y: 286,
    width: 69,
    height: 43,
    rotate: -4,
  },
  {
    id: "middle-seal",
    kind: "seal",
    x: 193,
    y: 289,
    width: 35,
    height: 35,
    rotate: -6,
  },
  {
    id: "middle-left-repository",
    kind: "repository",
    x: 127,
    y: 292,
    width: 60,
    height: 41,
    rotate: 5,
  },
  {
    id: "lower-core-project",
    kind: "project",
    x: 177,
    y: 343,
    width: 74,
    height: 45,
    rotate: -3,
  },
  {
    id: "lower-core-document",
    kind: "document",
    x: 265,
    y: 343,
    width: 68,
    height: 43,
    rotate: 4,
    accent: true,
  },
  {
    id: "lower-edge-link",
    kind: "link",
    x: 342,
    y: 329,
    width: 48,
    height: 28,
    rotate: -7,
  },
  {
    id: "lower-left-code",
    kind: "code",
    x: 119,
    y: 352,
    width: 64,
    height: 43,
    rotate: 6,
  },
  {
    id: "transition-architecture",
    kind: "architecture",
    x: 202,
    y: 399,
    width: 78,
    height: 45,
    rotate: -2,
  },
  {
    id: "transition-document",
    kind: "document",
    x: 293,
    y: 398,
    width: 56,
    height: 40,
    rotate: 5,
  },
  {
    id: "vertical-document",
    kind: "document",
    x: 208,
    y: 453,
    width: 61,
    height: 56,
    rotate: 2,
  },
  {
    id: "vertical-terminal",
    kind: "terminal",
    x: 280,
    y: 452,
    width: 59,
    height: 42,
    rotate: -3,
    accent: true,
  },
  {
    id: "vertical-repository",
    kind: "repository",
    x: 240,
    y: 504,
    width: 65,
    height: 40,
    rotate: 4,
  },
  {
    id: "base-left-project",
    kind: "project",
    x: 105,
    y: 469,
    width: 91,
    height: 54,
    rotate: -5,
  },
  {
    id: "base-outer-architecture",
    kind: "architecture",
    x: 48,
    y: 517,
    width: 87,
    height: 50,
    rotate: 4,
    soft: true,
  },
  {
    id: "base-left-document",
    kind: "document",
    x: 145,
    y: 530,
    width: 74,
    height: 46,
    rotate: -2,
  },
  {
    id: "base-right-code",
    kind: "code",
    x: 313,
    y: 506,
    width: 77,
    height: 46,
    rotate: 3,
  },
  {
    id: "base-right-project",
    kind: "project",
    x: 373,
    y: 527,
    width: 84,
    height: 51,
    rotate: -4,
    accent: true,
  },
  {
    id: "base-outer-repository",
    kind: "repository",
    x: 442,
    y: 558,
    width: 55,
    height: 39,
    rotate: 8,
    soft: true,
  },
  {
    id: "dissolve-left-document",
    kind: "document",
    x: 89,
    y: 579,
    width: 64,
    height: 32,
    rotate: 5,
    soft: true,
  },
  {
    id: "dissolve-seal",
    kind: "seal",
    x: 184,
    y: 574,
    width: 32,
    height: 32,
    rotate: -5,
    soft: true,
  },
  {
    id: "dissolve-link",
    kind: "link",
    x: 274,
    y: 570,
    width: 48,
    height: 27,
    rotate: 4,
    soft: true,
  },
  {
    id: "dissolve-document-right",
    kind: "document",
    x: 333,
    y: 586,
    width: 62,
    height: 32,
    rotate: -5,
    soft: true,
  },
  {
    id: "outside-upper-left-document",
    kind: "document",
    x: 91,
    y: 152,
    width: 47,
    height: 31,
    rotate: -10,
    secondary: true,
    motion: "a",
  },
  {
    id: "outside-upper-right-repository",
    kind: "repository",
    x: 414,
    y: 158,
    width: 41,
    height: 30,
    rotate: 10,
    secondary: true,
    motion: "b",
  },
  {
    id: "outside-lower-terminal",
    kind: "terminal",
    x: 449,
    y: 468,
    width: 53,
    height: 32,
    rotate: 8,
    secondary: true,
    motion: "c",
  },
]

function groupTransform({ x, y, rotate = 0 }: FragmentProps) {
  return `translate(${x} ${y}) rotate(${rotate})`
}

function EvidenceDocument(props: FragmentProps) {
  const { width, height } = props
  return (
    <g transform={groupTransform(props)}>
      <rect className={styles.surface} width={width} height={height} rx="6" />
      <path
        className={styles.detail}
        d={`M${width - 16} 1v12h15`}
        opacity="0.55"
      />
      <path
        className={styles.detail}
        d={`M10 ${height * 0.4}h${width * 0.46}M10 ${height * 0.58}h${width * 0.67}M10 ${height * 0.76}h${width * 0.38}`}
      />
    </g>
  )
}

function CodeFragment(props: FragmentProps) {
  const { width, height } = props
  return (
    <g transform={groupTransform(props)}>
      <rect
        className={styles.codeSurface}
        width={width}
        height={height}
        rx="6"
      />
      <path
        className={styles.codeDetail}
        d={`M14 ${height * 0.32}l-5 5 5 5M${width - 14} ${height * 0.32}l5 5-5 5`}
      />
      <path
        className={styles.codeDetail}
        d={`M25 ${height * 0.35}h${width * 0.24}M25 ${height * 0.55}h${width * 0.43}M25 ${height * 0.72}h${width * 0.3}`}
        opacity="0.62"
      />
    </g>
  )
}

function ProjectFragment(props: FragmentProps) {
  const { width, height } = props
  return (
    <g transform={groupTransform(props)}>
      <rect className={styles.surface} width={width} height={height} rx="6" />
      <path
        className={styles.detail}
        d={`M9 13h${width * 0.3}l5 5h${width * 0.34}`}
      />
      <rect
        className={styles.mutedSurface}
        x="9"
        y={height * 0.58}
        width={width * 0.28}
        height={height * 0.2}
        rx="2"
      />
      <path
        className={styles.detail}
        d={`M${width * 0.47} ${height * 0.62}h${width * 0.36}M${width * 0.47} ${height * 0.76}h${width * 0.24}`}
      />
    </g>
  )
}

function RepositoryFragment(props: FragmentProps) {
  const { width, height } = props
  return (
    <g transform={groupTransform(props)}>
      <rect className={styles.surface} width={width} height={height} rx="6" />
      <path
        className={styles.detail}
        d={`M${width * 0.3} ${height * 0.25}v${height * 0.44}c0 ${height * 0.12} ${width * 0.14} ${height * 0.12} ${width * 0.24} ${height * 0.12}h${width * 0.12}M${width * 0.3} ${height * 0.45}h${width * 0.28}v-${height * 0.2}`}
      />
      <circle
        className={styles.surface}
        cx={width * 0.3}
        cy={height * 0.22}
        r="3"
      />
      <circle
        className={styles.surface}
        cx={width * 0.58}
        cy={height * 0.22}
        r="3"
      />
      <circle
        className={styles.surface}
        cx={width * 0.7}
        cy={height * 0.81}
        r="3"
      />
    </g>
  )
}

function ArchitectureFragment(props: FragmentProps) {
  const { width, height } = props
  return (
    <g transform={groupTransform(props)}>
      <rect className={styles.surface} width={width} height={height} rx="6" />
      <path
        className={styles.detail}
        d={`M${width * 0.22} ${height * 0.3}L${width * 0.5} ${height * 0.66} ${width * 0.78} ${height * 0.3}`}
      />
      {[0.22, 0.5, 0.78].map((position, index) => (
        <rect
          key={position}
          className={styles.mutedSurface}
          x={width * position - 4}
          y={(index === 1 ? height * 0.66 : height * 0.3) - 4}
          width="8"
          height="8"
          rx="2"
        />
      ))}
    </g>
  )
}

function LinkFragment(props: FragmentProps) {
  const { width, height } = props
  return (
    <g transform={groupTransform(props)}>
      <rect className={styles.surface} width={width} height={height} rx="6" />
      <path
        className={styles.detail}
        d={`M${width * 0.42} ${height * 0.35}l-${width * 0.12} ${height * 0.12}a6 6 0 0 0 8 8l${width * 0.12}-${height * 0.12}M${width * 0.58} ${height * 0.65}l${width * 0.12}-${height * 0.12}a6 6 0 0 0-8-8l-${width * 0.12} ${height * 0.12}`}
      />
    </g>
  )
}

function TerminalFragment(props: FragmentProps) {
  const { width, height } = props
  return (
    <g transform={groupTransform(props)}>
      <rect
        className={styles.codeSurface}
        width={width}
        height={height}
        rx="6"
      />
      <path
        className={styles.codeDetail}
        d={`M11 ${height * 0.42}l6 5-6 5M23 ${height * 0.62}h${width * 0.28}`}
      />
    </g>
  )
}

function VerificationSeal(props: FragmentProps) {
  const { width, height, featured } = props
  return (
    <g className={styles.verified} transform={groupTransform(props)}>
      <path
        className={styles.verifiedSurface}
        d={`M${width / 2} 1L${width - 4} ${height * 0.22}v${height * 0.34}c0 ${height * 0.22}-${width * 0.22} ${height * 0.36}-${width * 0.5} ${height * 0.42}C${width * 0.22} ${height * 0.92} 4 ${height * 0.78} 4 ${height * 0.56}V${height * 0.22}Z`}
      />
      <path
        className={`${styles.verifiedDetail} ${featured ? styles.featuredCheck : ""}`}
        d={`M${width * 0.3} ${height * 0.49}l${width * 0.14} ${height * 0.13} ${width * 0.28}-${height * 0.3}`}
      />
    </g>
  )
}

function FragmentShape({ kind, ...props }: FragmentSpec) {
  switch (kind) {
    case "architecture":
      return <ArchitectureFragment {...props} />
    case "code":
      return <CodeFragment {...props} />
    case "document":
      return <EvidenceDocument {...props} />
    case "link":
      return <LinkFragment {...props} />
    case "project":
      return <ProjectFragment {...props} />
    case "repository":
      return <RepositoryFragment {...props} />
    case "seal":
      return <VerificationSeal {...props} />
    case "terminal":
      return <TerminalFragment {...props} />
  }
}

function fragmentClassName(fragment: FragmentSpec) {
  return [
    styles.fragment,
    fragment.accent ? styles.accent : "",
    fragment.soft ? styles.soft : "",
    fragment.secondary ? styles.secondary : "",
  ]
    .filter(Boolean)
    .join(" ")
}

function motionClassName(motion: FragmentSpec["motion"]) {
  if (motion === "a") return styles.motionDriftA
  if (motion === "b") return styles.motionDriftB
  if (motion === "c") return styles.motionDriftC
  return undefined
}

export function EvidenceProfileIllustration() {
  return (
    <svg
      className={styles.illustration}
      viewBox="0 0 520 620"
      role="img"
      aria-labelledby="evidence-profile-title evidence-profile-description"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="evidence-profile-title">
        Professional identity assembled from evidence
      </title>
      <desc id="evidence-profile-description">
        An abstract editorial arrangement of credential documents, code,
        repository branches, project evidence, and verification marks that
        gradually resolves into a professional profile.
      </desc>
      {fragments.map((fragment) => (
        <g key={fragment.id} className={motionClassName(fragment.motion)}>
          <g className={fragmentClassName(fragment)}>
            <FragmentShape {...fragment} />
          </g>
        </g>
      ))}
    </svg>
  )
}
