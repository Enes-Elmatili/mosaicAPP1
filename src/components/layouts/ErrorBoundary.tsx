"useme"

import * as React from "react"

type ErrorBoundaryProps = {
  children: React.ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Une erreur est survenue
          </h1>
          <p className="text-neutral-700 mb-8">
            {this.state.error?.message ??
              "Quelque chose s'est mal passé. Veuillez réessayer."}
          </p>
          <a
            href="/"
            className="rounded-md bg-primary px-4 py-2 text-white font-medium hover:bg-primary/90"
          >
            Retour à l’accueil
          </a>
        </div>
      )
    }
    return this.props.children
  }
}
