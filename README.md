# ArchiveX

ArchiveX es una plataforma web de vanguardia diseñada para la gestión, centralización y verificación de perfiles académicos e información de investigadores. El sistema ofrece un entorno seguro y de alto rendimiento que unifica el control de datos personales, documentación verificable y visualización corporativa en una sola interfaz optimizada.

## 🚀 Características Principales

* **Control de Identidad Dinámico:** Visualización y actualización en tiempo real de perfiles, datos de contacto, identificación y trayectorias profesionales.
* **Seguridad y Persistencia Crítica:** Arquitectura de autenticación con validación jerárquica cruzada (State, SessionStorage y LocalStorage) que elimina por completo el riesgo de fuga de datos (*data leakage*) en entornos multiusuario.
* **Gestión de Soportes Binarios:** Procesamiento nativo y previsualización inmediata de imágenes de perfil junto con carga estructurada de certificaciones en formato PDF.
* **Módulo de Impresión Profesional:** Interfaz adaptada con reglas CSS de inyección limpia para la exportación directa de certificados a formato físico o PDF sin elementos residuales de navegación.
* **Integración API REST:** Conectividad desacoplada de alta fluidez para la persistencia, consulta y mutación de registros en servidores centrales.

## 🛠️ Stack Tecnológico

* **Frontend:** React, Tailwind CSS
* **Manejo de Estado & Efectos:** React Hooks (`useState`, `useEffect`) con reactividad basada en dependencias estrictas.
* **Consumo de Servicios:** Fetch API con inyección de cabeceras de autorización Bearer Token.

## 🔧 Configuración del Módulo Frontend

1. **Clonar el repositorio:**
   git clone https://github.com/tu-usuario/ArchiveX.git

2. **Instalar dependencias del proyecto:**
   npm install

3. **Variables de Entorno:**
   Asegúrate de que tu pasarela de servicios esté corriendo en el puerto local asignado. Por defecto, el componente apunta a:
   `http://localhost:5000/api`

4. **Iniciar el entorno de desarrollo:**
   npm run dev

## 📄 Licencia

Este proyecto es propiedad privada y está desarrollado bajo estándares de uso institucional. Prohibida su reproducción total o parcial sin autorización del equipo de desarrollo de ArchiveX.