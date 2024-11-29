'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log('Form submitted:', { email, username, password, isLogin });

    try {
      let result;
      if (isLogin) {
        console.log('Tentative de connexion...');
        result = await login(email, password);
      } else {
        console.log('Tentative d\'inscription...');
        if (password !== passwordConfirm) {
          setError('Les mots de passe ne correspondent pas');
          return;
        }
        result = await register(email, password, passwordConfirm, username);
      }

      console.log('Résultat:', result);

      if (result.success) {
        console.log('Opération réussie, fermeture du modal...');
        setEmail('');
        setUsername('');
        setPassword('');
        setPasswordConfirm('');
        onClose();
      } else {
        console.error('Erreur:', result.error);
        setError(result.error || 'Une erreur est survenue');
      }
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setError('Une erreur inattendue est survenue');
    }
  };

  const resetForm = () => {
    setEmail('');
    setUsername('');
    setPassword('');
    setPasswordConfirm('');
    setError('');
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#141414]/90 backdrop-blur-xl p-6 text-left align-middle shadow-xl transition-all border border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-xl font-medium text-white">
                    {isLogin ? 'Se connecter' : "S'inscrire"}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                        Pseudo
                      </label>
                      <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 block w-full rounded-lg bg-black/50 border border-white/10 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5"
                        required={!isLogin}
                        placeholder="Votre pseudo"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full rounded-lg bg-black/50 border border-white/10 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5"
                      required
                      placeholder="vous@exemple.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 block w-full rounded-lg bg-black/50 border border-white/10 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5"
                      required
                      placeholder="8 caractères minimum"
                    />
                  </div>

                  {!isLogin && (
                    <div>
                      <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-300">
                        Confirmer le mot de passe
                      </label>
                      <input
                        type="password"
                        id="passwordConfirm"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        className="mt-1 block w-full rounded-lg bg-black/50 border border-white/10 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5"
                        required={!isLogin}
                        placeholder="Confirmez votre mot de passe"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    {isLogin ? 'Se connecter' : "S'inscrire"}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      resetForm();
                    }}
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
                  >
                    {isLogin
                      ? "Pas encore de compte ? S'inscrire"
                      : 'Déjà un compte ? Se connecter'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
