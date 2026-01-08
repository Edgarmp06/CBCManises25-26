/**
 * Módulo de Gestión de Administración
 *
 * Responsabilidades:
 * - Autenticación de administradores
 * - Control de permisos
 * - Gestión del panel de administración
 */

import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

export class AdminManager {
    /**
     * @param {FirebaseApp} app - Instancia de Firebase App
     * @param {Function} onAuthChange - Callback cuando cambia el estado de auth
     */
    constructor(app, onAuthChange) {
        this.app = app;
        this.auth = getAuth(app);
        this.isAdmin = false;
        this.showAdminPanel = false;
        this.usuario = null; // Usuario autenticado actual
        this.onAuthChange = onAuthChange;
    }

    /**
     * Establece la referencia a la instancia de la app principal
     * @param {Object} appInstance - Instancia de CBCManisesApp
     */
    setAppInstance(appInstance) {
        this.appInstance = appInstance;
        console.log('🔗 AdminManager vinculado a la app principal');
    }

    /**
     * Inicia el listener de autenticación
     */
    iniciarListenerAuth() {
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                this.isAdmin = true;
                this.usuario = user; // Guardar usuario autenticado
                console.log('👤 Usuario autenticado:', user.email);
                console.log('🔄 Re-renderizando UI con estado admin actualizado');
            } else {
                this.isAdmin = false;
                this.usuario = null;
                this.showAdminPanel = false;
                console.log('👤 Usuario no autenticado');
            }

            // Notificar cambio de autenticación
            if (this.onAuthChange) {
                this.onAuthChange(this.isAdmin);
            }

            // CRUCIAL: Re-renderizar UI después de cambio de autenticación
            // Esto asegura que los botones de admin aparezcan cuando el usuario se loguea
            if (this.appInstance && this.appInstance.uiManager) {
                setTimeout(() => {
                    console.log('🎨 Ejecutando re-render post-autenticación');
                    this.appInstance.renderizar();
                }, 100); // Pequeño delay para asegurar que todo se haya actualizado
            }
        });
    }

    /**
     * Verifica si el usuario actual es admin
     * @returns {boolean}
     */
    esAdmin() {
        return this.isAdmin;
    }

    /**
     * Verifica si el panel de admin está visible
     * @returns {boolean}
     */
    panelVisible() {
        return this.showAdminPanel;
    }

    /**
     * Login de administrador
     * @param {string} email - Email del administrador
     * @param {string} password - Contraseña
     * @returns {Promise<void>}
     */
    async login(email, password) {
        if (!email || !password) {
            throw new Error('Email y contraseña son obligatorios');
        }

        try {
            await signInWithEmailAndPassword(this.auth, email, password);
            this.isAdmin = true;
            console.log('✅ Login exitoso');
        } catch (error) {
            console.error('❌ Error de login:', error);

            // Mensajes de error más amigables
            let mensaje = 'Error al iniciar sesión';

            switch (error.code) {
                case 'auth/invalid-email':
                    mensaje = 'Email inválido';
                    break;
                case 'auth/user-disabled':
                    mensaje = 'Usuario deshabilitado';
                    break;
                case 'auth/user-not-found':
                    mensaje = 'Usuario no encontrado';
                    break;
                case 'auth/wrong-password':
                    mensaje = 'Contraseña incorrecta';
                    break;
                case 'auth/invalid-credential':
                    mensaje = 'Credenciales inválidas';
                    break;
                case 'auth/too-many-requests':
                    mensaje = 'Demasiados intentos. Intenta más tarde';
                    break;
            }

            throw new Error(mensaje);
        }
    }

    /**
     * Login con prompt interactivo
     * @returns {Promise<void>}
     */
    async loginConPrompt() {
        const email = prompt('Email de administrador:');
        if (!email) return;

        const password = prompt('Contraseña:');
        if (!password) return;

        try {
            await this.login(email, password);
            alert('✅ Acceso concedido');
        } catch (error) {
            alert(`❌ ${error.message}`);
        }
    }

    /**
     * Logout del administrador
     * @returns {Promise<void>}
     */
    async logout() {
        try {
            await signOut(this.auth);
            this.isAdmin = false;
            this.showAdminPanel = false;
            console.log('✅ Logout exitoso');
        } catch (error) {
            console.error('❌ Error al cerrar sesión:', error);
            throw error;
        }
    }

    /**
     * Toggle del panel de administración
     */
    toggleAdminPanel() {
        this.showAdminPanel = !this.showAdminPanel;
        console.log(`🔧 Panel admin: ${this.showAdminPanel ? 'visible' : 'oculto'}`);
    }

    /**
     * Muestra el panel de administración
     */
    mostrarPanel() {
        this.showAdminPanel = true;
    }

    /**
     * Oculta el panel de administración
     */
    ocultarPanel() {
        this.showAdminPanel = false;
    }

    /**
     * Obtiene el usuario actual
     * @returns {Object|null} Usuario actual o null
     */
    getUsuarioActual() {
        return this.auth.currentUser;
    }

    /**
     * Verifica si una acción requiere permisos de admin
     * @param {Function} callback - Función a ejecutar
     * @param {string} mensajeError - Mensaje si no tiene permisos
     */
    requiereAdmin(callback, mensajeError = 'Requiere permisos de administrador') {
        if (this.isAdmin) {
            callback();
        } else {
            console.warn('⚠️', mensajeError);
            alert(mensajeError);
        }
    }
}
