import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

interface LoginFormData {
  email: string;
}

export const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const navigate = useNavigate();
  const location = useLocation();
  const onSubmit = async (data: LoginFormData) => {
    try {
      const ADMIN_EMAIL = 'enes.elmatili@outlook.com';
      if (data.email.toLowerCase() !== ADMIN_EMAIL) {
        throw new Error('Adresse email non reconnue');
      }
      // Utilisation de la master key en backend, mock front-end par email
      await login(import.meta.env.VITE_MASTER_KEY);
      toast.success('Connexion réussie !');
      const from = (location.state as any)?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de connexion');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Connexion</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input
            id="email"
            type="email"
            {...register('email', { required: 'L’adresse email est requise' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Email admin"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};
