// Configuración del sistema
export class SystemSettings {
    constructor() {
        this.db = firebase.firestore();
        this.loadSettings();
    }

    async loadSettings() {
        try {
            const doc = await this.db.collection('settings').doc('system').get();
            if (doc.exists) {
                return doc.data();
            } else {
                // Crear configuración por defecto
                const defaultSettings = {
                    theme: {
                        primaryColor: '#6a0dad',
                        secondaryColor: '#f8f9fa',
                        darkMode: false
                    },
                    notifications: {
                        lowStock: true,
                        newOrders: true,
                        userRegistrations: true
                    },
                    backup: {
                        automatic: true,
                        frequency: 'daily',
                        lastBackup: null
                    },
                    general: {
                        siteName: 'Fashion Collection',
                        currency: 'L',
                        language: 'es',
                        timezone: 'America/Tegucigalpa'
                    }
                };
                await this.saveSettings(defaultSettings);
                return defaultSettings;
            }
        } catch (error) {
            console.error('Error cargando configuración:', error);
            throw error;
        }
    }

    async saveSettings(settings) {
        try {
            await this.db.collection('settings').doc('system').set(settings, { merge: true });
            Swal.fire({
                title: '¡Configuración Guardada!',
                text: 'Los cambios se han guardado correctamente',
                icon: 'success',
                confirmButtonColor: '#28a745'
            });
        } catch (error) {
            console.error('Error guardando configuración:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron guardar los cambios',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
            throw error;
        }
    }

    async createBackup() {
        try {
            Swal.fire({
                title: 'Creando Respaldo...',
                text: 'Por favor espera mientras se crea el respaldo',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const collections = ['products', 'users', 'orders', 'inventory', 'settings'];
            const backup = {
                timestamp: new Date(),
                data: {}
            };

            for (const collection of collections) {
                const snapshot = await this.db.collection(collection).get();
                backup.data[collection] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            }

            // Guardar respaldo en Firestore
            await this.db.collection('backups').add(backup);

            // Actualizar fecha del último respaldo
            await this.db.collection('settings').doc('system').update({
                'backup.lastBackup': new Date()
            });

            Swal.fire({
                title: '¡Respaldo Creado!',
                text: 'El respaldo se ha creado exitosamente',
                icon: 'success',
                confirmButtonColor: '#28a745'
            });

        } catch (error) {
            console.error('Error creando respaldo:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo crear el respaldo',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
        }
    }

    async restoreBackup(backupId) {
        try {
            const result = await Swal.fire({
                title: '¿Restaurar Respaldo?',
                text: 'Esta acción sobrescribirá todos los datos actuales. ¿Estás seguro?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, restaurar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#dc3545'
            });

            if (!result.isConfirmed) return;

            Swal.fire({
                title: 'Restaurando...',
                text: 'Por favor espera mientras se restaura el respaldo',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const backupDoc = await this.db.collection('backups').doc(backupId).get();
            if (!backupDoc.exists) {
                throw new Error('Respaldo no encontrado');
            }

            const backup = backupDoc.data();
            const batch = this.db.batch();

            // Restaurar cada colección
            for (const [collectionName, documents] of Object.entries(backup.data)) {
                for (const doc of documents) {
                    const docRef = this.db.collection(collectionName).doc(doc.id);
                    const { id, ...data } = doc;
                    batch.set(docRef, data);
                }
            }

            await batch.commit();

            Swal.fire({
                title: '¡Respaldo Restaurado!',
                text: 'Los datos se han restaurado exitosamente',
                icon: 'success',
                confirmButtonColor: '#28a745'
            });

        } catch (error) {
            console.error('Error restaurando respaldo:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo restaurar el respaldo',
                icon: 'error',
                confirmButtonColor: '#dc3545'
            });
        }
    }

    async getBackupsList() {
        try {
            const snapshot = await this.db.collection('backups')
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error obteniendo lista de respaldos:', error);
            return [];
        }
    }

    renderSettingsInterface() {
        return `
            <div class="container-fluid">
                <div class="row">
                    <!-- Configuración General -->
                    <div class="col-md-6">
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5><i class="fas fa-cog me-2"></i>Configuración General</h5>
                            </div>
                            <div class="card-body">
                                <form id="generalSettingsForm">
                                    <div class="mb-3">
                                        <label class="form-label">Nombre del Sitio</label>
                                        <input type="text" class="form-control" name="siteName" value="Fashion Collection">
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Moneda</label>
                                        <select class="form-select" name="currency">
                                            <option value="L">Lempiras (L)</option>
                                            <option value="$">Dólares ($)</option>
                                            <option value="€">Euros (€)</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Idioma</label>
                                        <select class="form-select" name="language">
                                            <option value="es">Español</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save me-1"></i>Guardar Cambios
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <!-- Configuración de Tema -->
                    <div class="col-md-6">
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5><i class="fas fa-palette me-2"></i>Personalización</h5>
                            </div>
                            <div class="card-body">
                                <form id="themeSettingsForm">
                                    <div class="mb-3">
                                        <label class="form-label">Color Primario</label>
                                        <input type="color" class="form-control form-control-color" name="primaryColor" value="#6a0dad">
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Color Secundario</label>
                                        <input type="color" class="form-control form-control-color" name="secondaryColor" value="#f8f9fa">
                                    </div>
                                    <div class="form-check mb-3">
                                        <input class="form-check-input" type="checkbox" name="darkMode" id="darkMode">
                                        <label class="form-check-label" for="darkMode">
                                            Modo Oscuro
                                        </label>
                                    </div>
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save me-1"></i>Aplicar Tema
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <!-- Notificaciones -->
                    <div class="col-md-6">
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5><i class="fas fa-bell me-2"></i>Notificaciones</h5>
                            </div>
                            <div class="card-body">
                                <form id="notificationSettingsForm">
                                    <div class="form-check mb-3">
                                        <input class="form-check-input" type="checkbox" name="lowStock" id="lowStock" checked>
                                        <label class="form-check-label" for="lowStock">
                                            Alertas de Stock Bajo
                                        </label>
                                    </div>
                                    <div class="form-check mb-3">
                                        <input class="form-check-input" type="checkbox" name="newOrders" id="newOrders" checked>
                                        <label class="form-check-label" for="newOrders">
                                            Nuevos Pedidos
                                        </label>
                                    </div>
                                    <div class="form-check mb-3">
                                        <input class="form-check-input" type="checkbox" name="userRegistrations" id="userRegistrations" checked>
                                        <label class="form-check-label" for="userRegistrations">
                                            Nuevos Registros de Usuario
                                        </label>
                                    </div>
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save me-1"></i>Guardar Preferencias
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <!-- Respaldos -->
                    <div class="col-md-6">
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5><i class="fas fa-database me-2"></i>Respaldos</h5>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <button class="btn btn-success w-100 mb-2" onclick="systemSettings.createBackup()">
                                        <i class="fas fa-download me-1"></i>Crear Respaldo Ahora
                                    </button>
                                    <button class="btn btn-info w-100 mb-2" onclick="showBackupsList()">
                                        <i class="fas fa-list me-1"></i>Ver Respaldos
                                    </button>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" name="automaticBackup" id="automaticBackup" checked>
                                    <label class="form-check-label" for="automaticBackup">
                                        Respaldos Automáticos
                                    </label>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Frecuencia</label>
                                    <select class="form-select" name="backupFrequency">
                                        <option value="daily">Diario</option>
                                        <option value="weekly">Semanal</option>
                                        <option value="monthly">Mensual</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Instancia global
window.systemSettings = new SystemSettings();

// Función para cargar la sección de configuración
export function loadSettingsSection() {
    const settingsContainer = document.querySelector('#settings-section .container-fluid');
    if (settingsContainer) {
        settingsContainer.innerHTML = systemSettings.renderSettingsInterface();
        
        // Cargar configuración actual
        systemSettings.loadSettings().then(settings => {
            // Llenar formularios con datos actuales
            if (settings.general) {
                const generalForm = document.getElementById('generalSettingsForm');
                if (generalForm) {
                    generalForm.siteName.value = settings.general.siteName || 'Fashion Collection';
                    generalForm.currency.value = settings.general.currency || 'L';
                    generalForm.language.value = settings.general.language || 'es';
                }
            }
            
            if (settings.theme) {
                const themeForm = document.getElementById('themeSettingsForm');
                if (themeForm) {
                    themeForm.primaryColor.value = settings.theme.primaryColor || '#6a0dad';
                    themeForm.secondaryColor.value = settings.theme.secondaryColor || '#f8f9fa';
                    themeForm.darkMode.checked = settings.theme.darkMode || false;
                }
            }
            
            if (settings.notifications) {
                const notificationForm = document.getElementById('notificationSettingsForm');
                if (notificationForm) {
                    notificationForm.lowStock.checked = settings.notifications.lowStock !== false;
                    notificationForm.newOrders.checked = settings.notifications.newOrders !== false;
                    notificationForm.userRegistrations.checked = settings.notifications.userRegistrations !== false;
                }
            }
        }).catch(error => {
            console.error('Error cargando configuración:', error);
        });
        
        // Configurar event listeners para los formularios
        setupSettingsEventListeners();
    }
}

// Configurar event listeners para los formularios de configuración
function setupSettingsEventListeners() {
    // Formulario de configuración general
    const generalForm = document.getElementById('generalSettingsForm');
    if (generalForm) {
        generalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const settings = {
                general: {
                    siteName: formData.get('siteName'),
                    currency: formData.get('currency'),
                    language: formData.get('language'),
                    timezone: 'America/Tegucigalpa'
                }
            };
            await systemSettings.saveSettings(settings);
        });
    }
    
    // Formulario de tema
    const themeForm = document.getElementById('themeSettingsForm');
    if (themeForm) {
        themeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const settings = {
                theme: {
                    primaryColor: formData.get('primaryColor'),
                    secondaryColor: formData.get('secondaryColor'),
                    darkMode: formData.has('darkMode')
                }
            };
            await systemSettings.saveSettings(settings);
            
            // Aplicar tema inmediatamente
            applyTheme(settings.theme);
        });
    }
    
    // Formulario de notificaciones
    const notificationForm = document.getElementById('notificationSettingsForm');
    if (notificationForm) {
        notificationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const settings = {
                notifications: {
                    lowStock: formData.has('lowStock'),
                    newOrders: formData.has('newOrders'),
                    userRegistrations: formData.has('userRegistrations')
                }
            };
            await systemSettings.saveSettings(settings);
        });
    }
}

// Aplicar tema
function applyTheme(theme) {
    if (theme.primaryColor) {
        document.documentElement.style.setProperty('--bs-primary', theme.primaryColor);
    }
    if (theme.secondaryColor) {
        document.documentElement.style.setProperty('--bs-secondary', theme.secondaryColor);
    }
    if (theme.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Función para mostrar lista de respaldos
window.showBackupsList = async function() {
    try {
        const backups = await systemSettings.getBackupsList();
        
        let backupsHtml = `
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Tamaño</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        backups.forEach(backup => {
            const date = new Date(backup.timestamp.seconds * 1000).toLocaleString();
            const size = Object.keys(backup.data).length;
            
            backupsHtml += `
                <tr>
                    <td>${date}</td>
                    <td>${size} colecciones</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="systemSettings.restoreBackup('${backup.id}')">
                            <i class="fas fa-upload"></i> Restaurar
                        </button>
                    </td>
                </tr>
            `;
        });

        backupsHtml += `
                    </tbody>
                </table>
            </div>
        `;

        Swal.fire({
            title: 'Lista de Respaldos',
            html: backupsHtml,
            width: '800px',
            confirmButtonText: 'Cerrar'
        });

    } catch (error) {
        console.error('Error mostrando lista de respaldos:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo cargar la lista de respaldos',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
    }
};
