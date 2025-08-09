import React from 'react';
import PageWrapper from '../../components/Layout/PageWrapper';
import { LoginForm } from '../../components/Auth/LoginForm';

const LoginPage: React.FC = () => (
  <PageWrapper title="Connexion">
    <LoginForm />
  </PageWrapper>
);

export default LoginPage;
