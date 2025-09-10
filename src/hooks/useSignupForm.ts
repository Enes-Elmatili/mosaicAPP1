import { create } from "zustand"

export type SignupData = {
  email: string
  password: string
  firstName: string
  lastName: string
  phonePrefix: string // préfixe séparé
  phone: string       // numéro sans préfixe
  role: "CLIENT"
}

type State = {
  data: SignupData
  update: (values: Partial<SignupData>) => void
  reset: () => void
  validate: () => { valid: boolean; errors: string[] }
}

export const useSignupForm = create<State>((set, get) => ({
  data: {
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phonePrefix: "+212",
    phone: "",
    role: "CLIENT",
  },

  update: (values) =>
    set((state) => ({
      data: { ...state.data, ...values },
    })),

  reset: () =>
    set({
      data: {
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phonePrefix: "+212",
        phone: "",
        role: "CLIENT",
      },
    }),

  validate: () => {
    const { email, password, firstName, lastName, phone } = get().data
    const errors: string[] = []

    if (!email.includes("@")) {
      errors.push("Email invalide")
    }
    if (password.length < 8) {
      errors.push("Le mot de passe doit contenir au moins 8 caractères")
    }
    if (!firstName.trim()) {
      errors.push("Le prénom est obligatoire")
    }
    if (!lastName.trim()) {
      errors.push("Le nom est obligatoire")
    }
    if (!phone.trim()) {
      errors.push("Le numéro de téléphone est obligatoire")
    }

    return { valid: errors.length === 0, errors }
  },
}))