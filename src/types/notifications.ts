export type NotificationType = "info" | "success" | "warning" | "error"

export type Notification = {
  id: string
  type: NotificationType
  title: string
  description?: string
  time: string
  read?: boolean
  onClick?: () => void
}
