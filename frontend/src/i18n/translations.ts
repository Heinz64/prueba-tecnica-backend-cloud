export type Language = 'es' | 'en';

export interface Translations {
  brand: string;
  footer: string;
  role: { admin: string; user: string };
  logout: string;
  login: {
    title: string;
    subtitle: string;
    usernameLabel: string;
    passwordLabel: string;
    submit: string;
    submitting: string;
    errors: {
      invalidCredentials: string;
      generic: string;
      network: string;
    };
  };
  score: {
    title: string;
    subtitleUser: string;
    subtitleAdmin: string;
    rutLabel: string;
    rutPlaceholder: string;
    submit: string;
    submitting: string;
    resultRutLabel: string;
    dateLabel: string;
    riskHigh: string;
    riskMedium: string;
    riskLow: string;
    errors: {
      forbidden: string;
      unauthorized: string;
      badFormat: string;
      generic: string;
      network: string;
    };
  };
}

const es: Translations = {
  brand: 'Riesgo Financiero',
  footer: 'Prueba técnica · consulta de riesgo financiero (MVP)',
  role: { admin: 'Administrador', user: 'Usuario' },
  logout: 'Cerrar sesión',
  login: {
    title: 'Iniciar sesión',
    subtitle: 'Ingresa tus credenciales para consultar el score de riesgo.',
    usernameLabel: 'Usuario',
    passwordLabel: 'Contraseña',
    submit: 'Ingresar',
    submitting: 'Ingresando…',
    errors: {
      invalidCredentials: 'Usuario o contraseña incorrectos.',
      generic: 'No se pudo iniciar sesión.',
      network: 'No se pudo conectar con el servidor.',
    },
  },
  score: {
    title: 'Consulta de score',
    subtitleUser: 'Consulta el score de riesgo asociado a tu RUT.',
    subtitleAdmin: 'Como administrador puedes consultar el score de cualquier RUT.',
    rutLabel: 'RUT',
    rutPlaceholder: '12.345.678-5',
    submit: 'Consultar',
    submitting: 'Consultando…',
    resultRutLabel: 'RUT consultado',
    dateLabel: 'Fecha de consulta:',
    riskHigh: 'Riesgo alto',
    riskMedium: 'Riesgo medio',
    riskLow: 'Riesgo bajo',
    errors: {
      forbidden: 'No tienes autorización para consultar el score de ese RUT.',
      unauthorized: 'Tu sesión expiró o no es válida. Vuelve a iniciar sesión.',
      badFormat: 'El RUT ingresado no tiene un formato válido.',
      generic: 'No se pudo consultar el score.',
      network: 'No se pudo conectar con el servidor.',
    },
  },
};

const en: Translations = {
  brand: 'Financial Risk',
  footer: 'Technical test · financial risk lookup (MVP)',
  role: { admin: 'Admin', user: 'User' },
  logout: 'Log out',
  login: {
    title: 'Log in',
    subtitle: 'Enter your credentials to check the risk score.',
    usernameLabel: 'Username',
    passwordLabel: 'Password',
    submit: 'Log in',
    submitting: 'Logging in…',
    errors: {
      invalidCredentials: 'Incorrect username or password.',
      generic: 'Could not log in.',
      network: 'Could not connect to the server.',
    },
  },
  score: {
    title: 'Score lookup',
    subtitleUser: 'Check the risk score linked to your RUT.',
    subtitleAdmin: 'As an admin you can check the score of any RUT.',
    rutLabel: 'RUT',
    rutPlaceholder: '12.345.678-5',
    submit: 'Look up',
    submitting: 'Looking up…',
    resultRutLabel: 'RUT queried',
    dateLabel: 'Query date:',
    riskHigh: 'High risk',
    riskMedium: 'Medium risk',
    riskLow: 'Low risk',
    errors: {
      forbidden: 'You are not authorized to check that RUT.',
      unauthorized: 'Your session expired or is invalid. Please log in again.',
      badFormat: 'The RUT entered is not a valid format.',
      generic: 'Could not fetch the score.',
      network: 'Could not connect to the server.',
    },
  },
};

export const translations: Record<Language, Translations> = { es, en };
