import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '../src/firebase';

// Inicializa una app secundaria para no interferir con la sesión principal
const app = initializeApp(firebaseConfig, 'AdminScript');
const auth = getAuth(app);

const [,, email, password] = process.argv;
if (!email || !password) {
  console.error('Uso: node createUser.js <email> <password>');
  process.exit(1);
}

createUserWithEmailAndPassword(auth, email, password)
  .then((cred) => {
    console.log(`Usuario ${cred.user.email} creado correctamente`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error al crear el usuario:', err.code, err.message);
    process.exit(1);
  });
