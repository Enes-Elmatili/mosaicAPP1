import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface SignupFormData {
  email: string;
  password: string;
  name: string;
  role: 'client' | 'prestataire';
}

export const SignupForm: React.FC = () => {
  const { signup, loading } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>();
  const navigate = useNavigate();

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signup(data.email, data.password, data.name, data.role);
      toast.success('Compte créé !');
      // Redirection dynamique selon le rôle sélectionné
      const destination = data.role === 'prestataire'
        ? '/app/provider/planning'
        : '/app/tenant/dashboard';
      navigate(destination);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création du compte');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto space-y-6">
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email', { required: 'Email requis' })} />
        {errors.email && <p className="text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="password">Mot de passe</label>
        <input id="password" type="password" {...register('password', { required: 'Mot de passe requis' })} />
        {errors.password && <p className="text-red-600">{errors.password.message}</p>}
      </div>
      <div>
        <label htmlFor="name">Nom</label>
        <input id="name" {...register('name', { required: 'Nom requis' })} />
        {errors.name && <p className="text-red-600">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="role">Vous êtes</label>
        <select id="role" {...register('role', { required: 'Role requis' })}>
          <option value="client">Client</option>
          <option value="prestataire">Prestataire</option>
        </select>
        {errors.role && <p className="text-red-600">{errors.role.message}</p>}
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'En cours...' : 'Créer mon compte'}
      </button>
    </form>
  );
};
