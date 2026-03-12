export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="text-2xl font-bold">Welcome to Certfolio!</h1>
          <p>
            This is a demo application built with Next.js, Drizzle ORM, and PostgreSQL. It serves as a starting point for building your own portfolio or project showcase.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Features</h2>
          <ul className="list-disc pl-6">
            <li>User authentication and session management</li>
            <li>CRUD operations for projects and certifications</li>
            <li>Responsive design for mobile and desktop</li>
            <li>Admin dashboard for managing users and content</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Getting Started</h2>
          <p>
            To explore the application, you can log in with the following credentials:
          </p>
          <ul className="list-disc pl-6">
            <li>Email: <code>demo@example.com</code></li>
            <li>Password: <code>password123</code></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
